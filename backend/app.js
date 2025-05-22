const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use('/images', express.static(path.join(__dirname, 'frontend/images')));
app.use(cors());
app.use(express.json());

// API routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const supportRoutes = require('./routes/supportRoutes');
app.use('/api/supports', supportRoutes);

// Phục vụ frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Route mặc định trả về index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/home.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
