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

// ✅ CORS को cookieParser से पहले लगाएं (Security best practice)
const allowedOrigins = ['https://cv-seven-eta.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(cookieParser());
app.use(express.json({ limit: '50mb' })); // Image uploads के लिए
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Debug middleware (Development mode में ही)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    next();
  });
}

// ✅ Basic routes
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Welcome to E-commerce API',
    version: '1.0.0',
    docs: '/api/health'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// ✅ Database और Cloudinary Connect
connectDB();
connectCloudinary();

// ✅ API Routes
app.use('/api/user', UserRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', ProductRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);



// ✅ Global Error Handler (सबसे अंत में)
app.use((err, req, res, next) => {
  console.error('🚨 Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // CORS specific error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'Cross-Origin Request Blocked'
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ✅ Server start
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ CORS enabled for:`);
  allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
});