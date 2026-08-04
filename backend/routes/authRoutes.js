import express from "express";
import { registerUser, loginUser, adminLogin, logoutUser } from "../controllers/authController.js";
import {protect} from "../middleware/authMiddleware.js";

const authRoutes = express.Router();

//api endpoint for login

//register
authRoutes.post("/register",registerUser);
//login
authRoutes.post("/login",loginUser);
//admin login
authRoutes.post("/admin/login",adminLogin);
//logout
authRoutes.post("/logout",logoutUser);
//get user profile
authRoutes.get("/profile",protect,getProfile);

export default authRoutes;