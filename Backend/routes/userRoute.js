import express from "express";
import { Router } from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import upload from "../middleware/multer.js";
import {
    register,
    login,
    logout,
    getProfile,
    editProfile,
    getSuggestedUser,
    followOrUnfollow,
    resetPassword
} from "../controllers/userController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post('/resetpassword', resetPassword);
router.get("/profile/:id", isAuthenticated, getProfile); // middleware appliead
router.post("/profile/edit", isAuthenticated, upload.single("profilePhoto"), editProfile);
router.get("/suggested", isAuthenticated, getSuggestedUser);
router.post("/followOrUnFollow/:id", isAuthenticated, followOrUnfollow);

export default router;