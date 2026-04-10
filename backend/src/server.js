const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

// Request logger
app.use((req, res, next) => {
    if (req.url.startsWith('/api/expert-query')) {
        console.log(`--- [DEBUG] Query Request ---`);
        console.log(`Method: ${req.method}`);
        console.log(`Content-Type: ${req.headers['content-type']}`);
    }
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
const authRoutes = require('./routes/auth.routes');
const expertQueryRoutes = require('./routes/expertQuery.routes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/expert-query', expertQueryRoutes);

// Basic Test Route
app.get('/', (req, res) => {
    res.json({ message: 'AgriSense Lanka Backend is running' });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('--- Backend Error ---');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Method:', req.method);
    console.error('URL:', req.url);
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('----------------------');

    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Configure MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Bypass ISP/University SRV blocks

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas');
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error.message);
        // During initial setup, we still run the server even if DB fails for testing purposes
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT} (Warning: MongoDB disconnected)`);
        });
    });
