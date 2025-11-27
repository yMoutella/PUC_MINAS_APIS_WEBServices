import { Kafka } from "kafkajs";

export default class KafkaClient {
  constructor() {
    this.kafka = new Kafka({
      clientId: "product-api",
      brokers: ["localhost:9092"],
    });
  }

  async sendMessage(topic, message) {
    const producer = this.kafka.producer();

    await producer.connect();
    await producer.send({
      topic: topic,
      messages: [
        {
          value: message,
          timestamp: Date.now().toString(),
        },
      ],
    });

    console.log(`Sent: ${message} to topic: ${topic}`);

    await producer.disconnect();
  }
}
