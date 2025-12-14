// =================== UserController.js ===================
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const isProd = process.env.NODE_ENV === "production";

// Cookie configuration
const cookieConfig = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax", // ✅ CRITICAL: "none" for cross-site
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

// ================== Register User ==================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // ✅ Set cookie with updated config
    res.cookie("token", token, cookieConfig);

    return res.json({
      success: true,
      user: { id: user._id, email: user.email, name: user.name },
      message: "Registration successful"
    });

  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== Login User ==================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // ✅ Set cookie with updated config
    res.cookie("token", token, cookieConfig);

    return res.json({
      success: true,
      user: { id: user._id, email: user.email, name: user.name },
      message: "Login successful"
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== Check Auth ==================
export const isAuth = async (req, res) => {
  try {
    console.log("🔍 Checking auth, cookies:", req.cookies);
    
    const token = req.cookies?.token;
    
    if (!token) {
      console.log("❌ No token found in cookies");
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    console.log("✅ User authenticated:", user.email);
    return res.json({ success: true, user });

  } catch (error) {
    console.error("Auth error:", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== Logout User ==================
export const logout = async (req, res) => {
  try {
    // ✅ Clear cookie with same config
    res.clearCookie("token", cookieConfig);

    return res.json({ success: true, message: "Logged out successfully" });

  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};