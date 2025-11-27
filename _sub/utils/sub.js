import { Kafka } from "kafkajs";
import fs from "fs";
import path from "path";

export default class Sub {
  constructor() {
    this.kafkaSub = new Kafka({
      clientId: "log-api",
      brokers: ["localhost:9092"],
    });
  }

  async consumer(apiInterface) {
    const consumer = this.kafkaSub.consumer({
      groupId: "product-group",
    });

    await consumer.connect();
    await consumer.subscribe({ topic: "product-logs", fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const logData = {
          timestamp: new Date().toISOString(),
          topic,
          partition,
          message: message.value.toString(),
        };

        console.log(logData);
        apiInterface.push(logData);

        // Write to JSON file
        this.writeToJsonFile(logData);
      },
    });
  }

  writeToJsonFile(data) {
    const filePath = path.join(process.cwd(), "logs", "kafka-logs.json");

    // Ensure logs directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Read existing data or create empty array
    let existingData = [];
    if (fs.existsSync(filePath)) {
      try {
        existingData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch (err) {
        console.error("Error reading existing JSON file:", err);
      }
    }

    // Add new data and write back
    existingData.push(data);
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
  }
}
