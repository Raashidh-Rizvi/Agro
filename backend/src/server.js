const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');

// Load environment variables
dotenv.config();

const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/agrisense';
const DEFAULT_JWT_SECRET = 'dev_secret_change_me';

process.env.MONGO_URI = process.env.MONGO_URI || DEFAULT_MONGO_URI;
process.env.JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

if (!process.env.MONGO_URI || process.env.MONGO_URI === DEFAULT_MONGO_URI) {
    console.warn('WARNING: MONGO_URI is not set. Falling back to local development MongoDB URI.');
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not set. Using a development fallback secret.');
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

// Request logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Routes
const authRoutes = require('./routes/auth.routes');
const expertQueryRoutes = require('./routes/expertQuery.routes');
const cropRoutes = require('./routes/crop.routes');
const diagnosisRoutes = require('./routes/diagnosis.routes');
const alertRoutes = require('./routes/alert.routes');
const produceRoutes = require('./routes/produce.routes');
const userRoutes = require('./routes/user.routes');
const statsRoutes = require('./routes/stats.routes');
const marketPriceRoutes = require('./routes/marketPrice.routes');


// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/expert-query', expertQueryRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/market-prices', marketPriceRoutes);


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

    const validationDetails = Object.values(err.errors || {}).map((fieldError) => fieldError.message);
    const isValidationError =
        err.name === 'ValidationError' ||
        validationDetails.length > 0 ||
        /validation failed/i.test(err.message || '');

    if (isValidationError) {
        const details = validationDetails.length > 0 ? validationDetails : [err.message || 'Validation failed'];
        return res.status(400).json({
            success: false,
            message: details[0] || 'Validation failed',
            errors: details
        });
    }

    if (err.code === 11000) {
        const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(400).json({
            success: false,
            message: `${duplicateField} already exists`
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid resource identifier'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Configure MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

dns.setServers(['8.8.8.8', '8.8.4.4']);

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
