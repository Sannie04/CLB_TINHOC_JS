const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes - Define before static file serving to ensure API calls are handled first
const resultRoutes = require('./routes/resultsRoutes');
const courseRoutes = require('./routes/coursesRoutes');
const authRoutes = require('./routes/authRoutes');
const supportRoutes = require('./routes/supportRoutes');
const studentRoutes = require('./routes/studentsRouter');

app.use('/api/results', resultRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/supports', supportRoutes);
app.use('/api/students', studentRoutes);

// Serve static files from the 'frontend' directory for all other routes
app.use(express.static(path.join(__dirname, '../frontend')));
// Optional: Serve images separately if they are stored outside the main frontend static directory structure
app.use('/images', express.static(path.join(__dirname, '../frontend/images'))); // Assuming images are in frontend/images

// Fallback route for SPA (Single Page Application) - serves index.html for any route not handled by APIs or static files
/*
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
*/

// Simple route for the root path to serve the primary entry point (e.g., courses.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/courses.html')); // Assuming courses.html is the main page
});

// **Thêm dòng khai báo biến port**
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
