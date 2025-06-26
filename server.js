const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Helper function to read from DB
const readDb = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist or is empty, return an empty object
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return {};
    }
    throw error;
  }
};

// Helper function to write to DB
const writeDb = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

// API Routes
app.get('/api/work-data', (req, res) => {
  res.json(readDb());
});

app.post('/api/work-data', (req, res) => {
  const { date, data } = req.body;
  if (!date || !data) {
    return res.status(400).json({ message: 'Date and data are required.' });
  }
  const db = readDb();
  db[date] = data;
  writeDb(db);
  res.status(200).json({ message: 'Data saved successfully.' });
});

app.delete('/api/work-data/:date', (req, res) => {
  const { date } = req.params;
  const db = readDb();
  if (db[date]) {
    delete db[date];
    writeDb(db);
    res.status(200).json({ message: 'Data deleted successfully.' });
  } else {
    res.status(404).json({ message: 'Data not found for this date.' });
  }
});

// Serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
