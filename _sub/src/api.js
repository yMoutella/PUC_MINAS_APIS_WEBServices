import express from "express";
import fs from 'fs';
import path from 'path';
import Sub from "../utils/sub.js";

const app = express();
const port = 3001;

app.use(express.json());

const sub = new Sub();
const logs = [];

// Start consuming messages and store in logs array
sub.consumer(logs);

// Function to read logs from JSON file
function readLogsFromFile() {
  const filePath = path.join(process.cwd(), 'logs', 'kafka-logs.json');
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (err) {
    console.error('Error reading logs file:', err);
    return [];
  }
}

app.get("/logs", async (req, res) => {
  try {
    // Read logs from JSON file
    const fileLogs = readLogsFromFile();
    
    // Combine with in-memory logs if needed
    const allLogs = [...fileLogs];
    
    res.json(allLogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

// Optional: endpoint to get only in-memory logs
app.get("/logs/memory", (req, res) => {
  res.json(logs);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
