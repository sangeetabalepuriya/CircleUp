import express from "express";
import { Router } from "express";
import upload from "../middleware/multer.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
    addNewPost,
    getAllPost,
    getUserPost,
    likePost,
    dislikePost,
    addComment,
    getCommentPost,
    deletePost,
    bookmarkPost,
    getSinglePost
} from "../controllers/postController.js";

const router = Router();

router.post("/addpost", upload.single("image"), isAuthenticated, addNewPost);
router.get("/all", isAuthenticated, getAllPost);
router.get("/userpost/all", isAuthenticated, getUserPost);
router.get("/like/:id", isAuthenticated, likePost);
router.get("/dislike/:id", isAuthenticated, dislikePost);
router.post("/comment/:id", isAuthenticated, addComment);
router.post("/comment/all/:id", isAuthenticated, getCommentPost);
router.delete("/delete/:id", isAuthenticated, deletePost);
router.get("/bookmark/:id", isAuthenticated, bookmarkPost);
router.get("/:id",isAuthenticated, getSinglePost);

export default router;