import express from "express";
import KafkaClient from "../util/kafkaClient.js";

const app = express();
const port = 3000;

app.use(express.json());

const products = [];

app.get("/products", (req, res) => {
  res.json(products);
});

app.get("/products/:id", (req, res) => {
  const id = req.params.id;
  const product = products.find((p) => p.id == id);

  if (product) {
    return res.status(200).json(product);
  } else {
    return res.status(404).json({ error: "Product not found" });
  }
});

app.post("/products", async (req, res) => {
  const product = req.body;
  products.push(product);

  // create product transaction log -- example

  const kafkaClient = new KafkaClient();

  await kafkaClient.sendMessage(
    "product-logs",
    `Product created: ${JSON.stringify(product)}`
  );

  console.log(`message sent: Product created: ${JSON.stringify(product)}`);

  res.status(201).json(product);
});

app.listen(port, () => {
  console.log("Products API up and running!");
});
