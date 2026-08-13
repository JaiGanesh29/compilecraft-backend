const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const adminRoutes = require('./routes/admin');
const quizRoutes = require('./routes/quiz');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use('/api/admin', adminRoutes);
app.use('/api/quiz', quizRoutes);

// Serve static frontend files from public folder
app.use(express.static(path.join(__dirname, '../public')));

// Fallback all non-API paths to serve index.html (SPA history routing support)
app.get('*path', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Catch-all Error handler
app.use((err, req, res, next) => {
  console.error('Server error stack:', err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CompileCraft server running on port ${PORT}`);
});
