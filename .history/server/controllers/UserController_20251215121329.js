// backend/controllers/UserController.js - COMPLETE FIXED VERSION
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Helper function to set CORS headers
const setCorsHeaders = (res, origin) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://cv-seven-eta.vercel.app',
    'https://cv-seven-eta.vercel.app/'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  return origin;
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    
    // Validation
    if (!name || !email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      username
    });

    // Generate token
    const token = generateToken(newUser._id.toString());
    
    // Set CORS headers
    const origin = req.headers.origin || 'http://localhost:5173';
    setCorsHeaders(res, origin);
    
    // Set cookie (for browser)
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    // Response
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token, // Also send token for localStorage
      user: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());
    
    // Set CORS headers
    const origin = req.headers.origin || 'http://localhost:5173';
    setCorsHeaders(res, origin);
    
    // Set cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    // Response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token, // Send token for localStorage
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        username: user.username
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

export const isAuth = async (req, res) => {
  try {
    let token;

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      console.log("Token from Authorization header");
    }
    // Get token from cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log("Token from cookie");
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Set CORS headers
    const origin = req.headers.origin || 'http://localhost:5173';
    setCorsHeaders(res, origin);

    // Response
    return res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Auth check error:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired" 
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Set CORS headers
    const origin = req.headers.origin || 'http://localhost:5173';
    setCorsHeaders(res, origin);
    
    // Clear cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    });

    // Response
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};