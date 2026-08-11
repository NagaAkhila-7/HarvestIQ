const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/error');

const app = express();

// Connect to MongoDB
connectDB();

// CORS setup supporting production, Vercel, and local development origins
const defaultAllowedOrigins = [
  'https://harvestiq-nu.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const envOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envOrigins]));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is explicitly allowed or matches local dev / Vercel preview domains
    const isAllowed = allowedOrigins.includes(origin) || 
      origin.startsWith('http://localhost:') || 
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.vercel.app');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-seed-secret']
};

// Enable CORS for all routes and handle preflight OPTIONS requests
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'harvestiq_cookie_secret_key_2026'));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Dynamic Health Check Handler
const getHealthStatus = (req, res) => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const dbState = mongoose.connection.readyState;
  const dbStatus = stateMap[dbState] || 'unknown';

  res.json({
    success: dbState === 1,
    message: 'HarvestIQ API is healthy',
    database: dbStatus,
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
};

// Root Health check endpoints
app.get('/health', getHealthStatus);
app.get('/healthz', getHealthStatus);

// API Routes
const apiPrefix = process.env.API_PREFIX || '/api/v1';
app.use(apiPrefix, routes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[HarvestIQ Backend] Server running on port ${PORT} (API Prefix: ${apiPrefix})`);
});

module.exports = app;
