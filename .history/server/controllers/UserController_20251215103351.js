import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ Common function to set CORS headers
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  return res;
};

// ================== Login User ==================
export const loginUser = async (req, res) => {
  try {
    setCorsHeaders(res);
    
    const { email, password } = req.body;
    console.log('🔑 Login attempt for:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ✅ FIXED: Cookie settings for localhost
    console.log('Setting cookie with options:', {
      secure: false, // Force false for localhost
      sameSite: 'lax',
      httpOnly: true
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // ✅ MUST be false for localhost
      sameSite: 'lax', // ✅ 'lax' for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    console.log('✅ Login successful - Cookie should be set');
    
    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.log("❌ Login error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== Register User ==================
export const registerUser = async (req, res) => {
  try {
    setCorsHeaders(res);
    
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ✅ FIXED: Cookie settings
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // ✅ MUST be false for localhost
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    console.log('✅ Registration successful - Cookie set');
    
    return res.json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.log("❌ Registration error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== Check Auth ==================
export const isAuth = async (req, res) => {
  try {
    setCorsHeaders(res);
    
    const token = req.cookies.token;
    console.log('🔍 isAuth check - Token in cookies:', token ? 'Present' : 'Missing');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized - No token found" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("❌ isAuth error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ================== Logout User ==================
export const logout = async (req, res) => {
  try {
    setCorsHeaders(res);
    
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/'
    });

    console.log('✅ User logged out');

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log("❌ Logout error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};