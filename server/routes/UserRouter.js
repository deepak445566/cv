import express from "express";
import { isAuth, loginUser, logout, registerUser } from "../controllers/UserController.js";
import authUser from "../middlewares/authUser.js";

const UserRouter = express.Router();

// Route for registration
UserRouter.post("/register", registerUser);
UserRouter.post("/login", loginUser);
UserRouter.get("/isauth",authUser, isAuth);
UserRouter.get("/logout",authUser, logout);
export default UserRouter;
