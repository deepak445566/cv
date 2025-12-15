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

// ✅ CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://game-tawny-nine-64.vercel.app'
];

// ✅ CORS को cookieParser से पहले लगाएं
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200
}));

// ✅ OPTIONS request handle करें (preflight)
app.options('*', cors());

app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); // File uploads के लिए
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Development के लिए Debug Middleware
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    console.log('Cookies received:', req.cookies);
    next();
  });
}

// ✅ Health Check (Better Version)
app.get('/api/health', (req, res) => {
  const healthcheck = {
    success: true,
    message: 'Server is running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage()
  };
  res.status(200).json(healthcheck);
});

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Welcome to E-commerce API',
    documentation: '/api-docs', // If you have Swagger/OpenAPI
    version: '1.0.0'
  });
});

// ✅ Database और Cloudinary Connect
connectDB();
connectCloudinary();

// ✅ Routes
app.use('/api/user', UserRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', ProductRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// ✅ 404 Handler (Routes के बाद ही)


// ✅ Error Handler (LAST middleware)
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  
  // CORS error handle
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS Error: Origin not allowed'
    });
  }
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    timestamp: new Date().toISOString()
  });
});

// ✅ Port Configuration
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Allowed Origins: ${allowedOrigins.join(', ')}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
});