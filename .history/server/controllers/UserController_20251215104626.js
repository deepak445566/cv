import User from "../models/userModels.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import Profile from "../models/profileModel.js";
import { uploadFile } from "../config/cloudconfig.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import crypto from "crypto";
import axios from "axios";   // ✅ Needed to fetch remote images
import Connect from "../models/connectionModel.js";
import Connection from "../models/connectionModel.js";



const generateToken = (userId) => {
  const payload = { userId };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    
    if (!name || !email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // Check if user already exists with email or username
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      username
    });

    const token = generateToken(newUser._id.toString());
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Create profile for new user
    const profile = new Profile({ userId: newUser._id });
    await profile.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username
      },
    });

  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id.toString());

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export const isAuth = async (req, res) => {
  try {
    let token;

    // ✅ Check Authorization header first (for frontend)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]; // remove 'Bearer '
    }
    // ✅ Fallback: Check cookies (if using cookies)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

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
    console.error("Auth check error:", error.message);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};














// ✅ Fixed: Make sure this export exists and is properly implemented
export const logoutUser = async (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};



export const uploadPicture = async (req, res) => {
  try {
    // ✅ User directly middleware se mil raha hai
    const user = req.user;  

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to ImageKit
    const fileUpload = await uploadFile(req.file.buffer, uuidv4());

    // ✅ Update user profile picture
    user.profilePicture = fileUpload.url;
    await user.save();

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: fileUpload.url,
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    res.status(500).json({ message: "Server error while uploading picture" });
  }
};


export const updateUserProfile = async (req, res) => {
  try {
    const user = req.user; // from protectUser middleware
    if (!user) return res.status(404).json({ message: "User not found" });

    // Directly req.body use kar sakte ho
    const newUser = req.body;

    // Check for username/email conflict
    const existingUser = await User.findOne({
      $or: [{ username: newUser.username }, { email: newUser.email }]
    });
    if (existingUser && String(existingUser._id) !== String(user._id)) {
      return res.status(400).json({ message: "Username or email already exists" });
    }


    // Update user
    Object.assign(user, newUser);
    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getUserAndProfile = async(req,res)=>{
  try {
    const user = req.user; 
    console.log('Req.user:', user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await Profile.findOne({userId:user._id}).populate('userId','name email username profilePicture');
    console.log('UserProfile:', userProfile);

    if (!userProfile) return res.status(404).json({ message: "Profile not found" });

    return res.status(200).json(userProfile);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}


export const updateProfileData = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    const newProfile = req.body;

    let profile = await Profile.findOne({ userId: user._id });

    if (!profile) {
      profile = new Profile({ userId: user._id });
    }

    Object.assign(profile, newProfile);
    await profile.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      profile
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllUserProfile = async (req, res) => {
  try {
    // Saare profiles le aao aur user ke basic details populate karo
    const profiles = await Profile.find()
      .populate('userId', 'name email username profilePicture');

    if (!profiles || profiles.length === 0) {
      return res.status(404).json({ message: "No profiles found" });
    }

    return res.status(200).json({
      success: true,
  
      profiles
    });
  } catch (error) {
    console.error("Error fetching profiles:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};






// Add this to your userController.js

// Get specific user profile by userId
export const getUserProfileById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find profile by userId and populate user details
    const profile = await Profile.findOne({ userId })
      .populate('userId', 'name email username profilePicture');

    if (!profile) {
      return res.status(404).json({ 
        success: false,
        message: "Profile not found" 
      });
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

const convertUserDataToPdf = async (userData) => {
  const doc = new PDFDocument();
  const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const fullPath = "uploads/" + outputPath;

  const stream = fs.createWriteStream(fullPath);
  doc.pipe(stream);

  // ✅ Handle profile picture (remote URL)
  if (userData.userId.profilePicture) {
    try {
      const response = await axios.get(userData.userId.profilePicture, { responseType: "arraybuffer" });
      const imgBuffer = Buffer.from(response.data, "binary");
      doc.image(imgBuffer, { align: "center", width: 100 });
    } catch (err) {
      console.error("Image load failed:", err.message);
    }
  }

  // ✅ User info
  doc.fontSize(14).text(`Name: ${userData.userId.name}`);
  doc.fontSize(14).text(`Username: ${userData.userId.username}`);
  doc.fontSize(14).text(`Email: ${userData.userId.email}`);
  doc.fontSize(14).text(`Bio: ${userData.bio || "N/A"}`);
  doc.fontSize(14).text(`Current Position: ${userData.currentPosition || "N/A"}`);

  // ✅ Past Work
  doc.moveDown().fontSize(14).text("Past Work:");
  if (userData.pastWork && userData.pastWork.length > 0) {
    userData.pastWork.forEach((work) => {
      doc.fontSize(12).text(`Company Name: ${work.companyName}`);
      doc.fontSize(12).text(`Position: ${work.position}`);
      doc.fontSize(12).text(`Years: ${work.years}`);
      doc.moveDown(0.5);
    });
  } else {
    doc.fontSize(12).text("No past work experience available.");
  }

  doc.end();

  return outputPath; // only return filename
};

// ----------------- RETURN PDF PATH -----------------
export const downloadProfile = async (req, res) => {
  try {
    const user_id = req.query.id;

    const userProfile = await Profile.findOne({ userId: user_id })
      .populate("userId", "name username email profilePicture");

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // ✅ Generate PDF
    const pdfFile = await convertUserDataToPdf(userProfile);

    // ✅ Return path instead of download
    return res.status(200).json({
      success: true,
      message: "PDF generated successfully",
      filePath: `/uploads/${pdfFile}`   // frontend can fetch it if uploads folder is static
    });
  } catch (error) {
    console.error("PDF Error:", error.message);
    res.status(500).json({ message: "Server error while generating PDF" });
  }
};




// Follow a user
export const followUser = async (req, res) => {
  try {
    const followerId = req.user._id; // Current user
    const { followingId } = req.body; // User to follow

    if (!followingId) {
      return res.status(400).json({
        success: false,
        message: "Following user ID is required"
      });
    }

    // Can't follow yourself
    if (followerId.toString() === followingId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself"
      });
    }

    // Check if user exists
    const userToFollow = await User.findById(followingId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User to follow not found"
      });
    }

    // Check if already following
    const existingConnection = await Connection.findOne({
      follower: followerId,
      following: followingId
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: "You are already following this user"
      });
    }

    // Create follow connection
    const connection = new Connection({
      follower: followerId,
      following: followingId,
      status: 'accepted'
    });

    await connection.save();

    res.status(200).json({
      success: true,
      message: "Successfully followed user",
      connection
    });

  } catch (error) {
    console.error("Follow error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while following user",
      error: error.message
    });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user._id; // Current user
    const { followingId } = req.body; // User to unfollow

    if (!followingId) {
      return res.status(400).json({
        success: false,
        message: "Following user ID is required"
      });
    }

    // Find and delete the connection
    const connection = await Connection.findOneAndDelete({
      follower: followerId,
      following: followingId
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "You are not following this user"
      });
    }

    res.status(200).json({
      success: true,
      message: "Successfully unfollowed user"
    });

  } catch (error) {
    console.error("Unfollow error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while unfollowing user",
      error: error.message
    });
  }
};

// Get all followers of a user
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get all followers with user details
    const followers = await Connection.find({ following: userId })
      .populate('follower', 'name username email profilePicture')
      .sort({ createdAt: -1 });

    const followersList = followers.map(connection => ({
      _id: connection.follower._id,
      name: connection.follower.name,
      username: connection.follower.username,
      email: connection.follower.email,
      profilePicture: connection.follower.profilePicture,
      followedAt: connection.createdAt
    }));

    res.status(200).json({
      success: true,
      count: followersList.length,
      followers: followersList
    });

  } catch (error) {
    console.error("Get followers error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching followers",
      error: error.message
    });
  }
};

// Get all users that a user is following
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get all users being followed
    const following = await Connection.find({ follower: userId })
      .populate('following', 'name username email profilePicture')
      .sort({ createdAt: -1 });

    const followingList = following.map(connection => ({
      _id: connection.following._id,
      name: connection.following.name,
      username: connection.following.username,
      email: connection.following.email,
      profilePicture: connection.following.profilePicture,
      followedAt: connection.createdAt
    }));

    res.status(200).json({
      success: true,
      count: followingList.length,
      following: followingList
    });

  } catch (error) {
    console.error("Get following error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching following list",
      error: error.message
    });
  }
};

// Get follower and following counts
export const getConnectionCounts = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const followerCount = await Connection.countDocuments({ following: userId });
    const followingCount = await Connection.countDocuments({ follower: userId });

    res.status(200).json({
      success: true,
      counts: {
        followers: followerCount,
        following: followingCount
      }
    });

  } catch (error) {
    console.error("Get connection counts error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching connection counts",
      error: error.message
    });
  }
};

// Check if current user is following a specific user
export const checkFollowingStatus = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { targetUserId } = req.params;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "Target user ID is required"
      });
    }

    const isFollowing = await Connection.findOne({
      follower: currentUserId,
      following: targetUserId
    });

    res.status(200).json({
      success: true,
      isFollowing: !!isFollowing
    });

  } catch (error) {
    console.error("Check following status error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while checking following status",
      error: error.message
    });
  }
};






