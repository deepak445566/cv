// backend/server.js - COMPLETE FIXED VERSION
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import UserRouter from './routes/UserRouter.js';
import sellerRouter from './routes/SellerRouter.js';
import connectCloudinary from './config/cloudconfig.js';
import ProductRouter from './routes/ProductRoute.js';
import cartRouter from './routes/CardRoute.js';
import addressRouter from './routes/AddressRoute.js';
import orderRouter from './routes/OrderRoute.js';

dotenv.config();
const app = express();

// ✅ CORS Configuration - Complete Fixed
const allowedOrigins = [
  'http://localhost:5173',                    // Local development
  'https://cv-seven-eta.vercel.app',          // Production frontend
  'https://cv-seven-eta.vercel.app/'         // With trailing slash
];

console.log('🚀 Server starting...');
console.log('✅ Allowed CORS origins:', allowedOrigins);

// ✅ CORS Middleware - MUST BE FIRST
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ Allowed CORS request from: ${origin}`);
      callback(null, true);
    } else {
      console.log(`🚫 CORS Blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie']
}));



app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Add CORS headers to all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  next();
});

// ✅ Test endpoints
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'E-commerce API is running',
    version: '1.0.0',
    cors: allowedOrigins
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    cors: 'Enabled'
  });
});

app.get('/api/test-cors', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'CORS test successful',
    origin: req.headers.origin,
    allowedOrigins: allowedOrigins
  });
});

// ✅ Database and Cloudinary connection
connectDB();
connectCloudinary();

// ✅ API Routes
app.use('/api/user', UserRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', ProductRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.message);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS: Origin not allowed',
      allowedOrigins: allowedOrigins
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: https://cv-icre.onrender.com/api/health`);
  console.log(`🎯 CORS enabled for:`, allowedOrigins);
});