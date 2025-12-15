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
const port = process.env.PORT || 3000;

// Database connect
await connectDB();
await connectCloudinary();

// ✅ MANUAL CORS MIDDLEWARE (cors package नहीं use कर रहे)
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  console.log('Cookies received:', req.cookies);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ✅ NEW IMPROVED TEST ENDPOINT
app.get('/api/test-cookie', (req, res) => {
  console.log('🎯 Test cookie endpoint called');
  
  // Set cookie with very permissive settings for testing
  res.cookie('test_cookie', 'test_value_' + Date.now(), {
    httpOnly: false, // Temporarily false for testing
    secure: false,   // MUST be false for localhost
    sameSite: 'none', // Most permissive
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
    domain: 'localhost' // Explicitly set domain
  });
  
  // Also set a non-httpOnly cookie for testing
  res.cookie('visible_cookie', 'visible_' + Date.now(), {
    httpOnly: false,
    secure: false,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  });
  
  console.log('🍪 Cookies set in response');
  
  res.json({
    success: true,
    message: 'Test cookie set',
    cookie_set: true,
    timestamp: new Date().toISOString(),
    cookie_headers_sent: true
  });
});

// ✅ SIMPLE LOGIN TEST ENDPOINT
app.post('/api/test-login', (req, res) => {
  console.log('🔑 Test login endpoint called');
  
  // Simulate a token
  const fakeToken = 'fake_jwt_token_' + Date.now();
  
  // Set cookie
  res.cookie('token', fakeToken, {
    httpOnly: false, // Temporary for testing
    secure: false,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  });
  
  console.log('✅ Test login cookie set:', fakeToken);
  
  res.json({
    success: true,
    message: 'Test login successful',
    token_set: true
  });
});

app.use('/api/user', UserRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', ProductRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// Server start
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`✅ Manual CORS enabled`);
  console.log(`✅ Allowing: http://localhost:5173`);
});