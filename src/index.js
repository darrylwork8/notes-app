require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDb } = require('./db');
const notesRouter = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/notes', notesRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }
}

start();
