import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Comment from "../models/commentModel.js";
import cloudinary from "../utils/cloudinary.js";
import sharp from "sharp";
import { getReceiverSocketId, io } from "../socket/socket.js";


async function addNewPost(req, res) {
    try {
        const { caption } = req.body;
        const image = req.file;
        const userId = req.id;
        //image upload
        if (!image) return res.status(400).json({ message: "Image required" });

        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: "inside" })
            .toFormat("jpeg", { quality: 80 })
            .toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: userId
        });

        const user = await User.findById(userId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: "author", select: "-password" });
        // EMIT real-time update
        io.emit("postCreated", post);

        return res.status(201).json({
            message: "New post added",
            post,
            success: true,
        })

    } catch (error) {
        console.log(error)
    }
}

async function getAllPost(req, res) {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: "author", select: "username profilePicture" })
            .populate({
                path: "comments",
                sort: { createdAt: -1 },
                populate: { path: "author", select: "username profilePicture" }
            });
        return res.status(200).json({
            posts,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

async function getUserPost(req, res) {
    try {
        const userId = req.id;
        const posts = await Post.find({ author: userId }).sort({ createdAt: -1 }).populate({
            path: "author",
            select: "username profilePicture"
        }).populate({
            path: "comments",
            options: { sort: { createdAt: -1 } },
            populate: {
                path: "author",
                select: "username profilePicture"
            }
        });

        return res.status(200).json({ posts, success: true});

    } catch (error) {
        console.log(error);
    }
}

async function likePost(req, res) {
    try {
        const userId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found", success: false });

        //Like Logic started
        await post.updateOne({ $addToSet: { likes: userId } });
        await post.save();

        //implementing socket io for real-time-notification
        const user = await User.findById(userId).select("username profilePicture");
        const postOwnerId = post.author.toString();
        if (postOwnerId != userId) {
            //emit a notification event
            const notification = {
                type: "like",
                userId: userId,
                userDetails: user,
                postId,
                message: "your post was liked"
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit("notification", notification);
        }

        return res.status(200).json({ message: "Post liked", success: true });
    } catch (error) {
        console.log(error);
    }
}

async function dislikePost(req, res) {
    try {
        const userId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found", success: false });

        //Like Logic started
        await post.updateOne({ $pull: { likes: userId } });
        await post.save();

        //implementing socket io for real-time-notification
        const user = await User.findById(userId).select("username profilePicture");
        const postOwnerId = post.author.toString();
        if (postOwnerId != userId) {
            //emit a notification event
            const notification = {
                type: "dislike",
                userId: userId,
                userDetails: user,
                postId,
                message: "your post was disliked"
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit("notification", notification);
        }

        return res.status(200).json({ message: "Post disliked", success: true });
    } catch (error) {
        console.log(error);
    }
}

async function addComment(req, res) {
    try {
        const postId = req.params.id;
        const commentUserId = req.id;
        const { text } = req.body;
        const post = await Post.findById(postId);

        if (!text) return res.status(400).json({
            message: "Text is reqired",
            success: false
        });

        const comment = await Comment.create({
            text,
            author: commentUserId,
            post: postId
        })

        await comment.populate({
            path: "author",
            select: "username profilePicture"
        });

        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message: "Comment Added",
            comment,
            success: true
        })

    } catch (error) {
        console.log(error);
    }
}

async function getCommentPost(req, res) {
    try {
        const postId = req.params.id;
        const comments = await Comment.find({ post: postId })
            .populate("author", "username profilePicture");

        if (!comments) return res.status(404).json({
            message: "No comments found for this post",
            success: false
        });
        return res.status(200).json({ success: true, comments });

    } catch (error) {
        console.log(error);
    }
}

async function deletePost(req, res) {
    try {
        const postId = req.params.id;
        const userId = req.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({
            message: "Post not found",
            success: false
        });

        //check if the logged-in user is the owner of the post
        if (post.author.toString() != userId) return res.status(403).json({ message: "Unauthorized" });

        //delete post 
        await Post.findByIdAndDelete(postId);

        //remove the post id from the user's post
        let user = await User.findById(userId);
        user.posts = user.posts.filter(id => id.toString() != postId);
        await user.save();

        //delete associated comments
        await Comment.deleteMany({ post: postId });

        //Emit postDeleted event
        io.emit("postDeleted", postId);

        return res.status(200).json({
            success: true,
            message: "Post deleted"
        })

    } catch (error) {
        console.log(error);
    }
}

async function bookmarkPost(req, res) {
    try {
        const postId = req.params.id;
        const userId = req.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found", success: false });

        const user = await User.findById(userId);
        if (user.bookmark.includes(post._id)) {
            //already bookmarked --> remove from the bookmark
            await user.updateOne({ $pull: { bookmark: post._id } });
            await user.save();
            return res.status(200).json({ type: "unsaved", message: "Post removed from the bookmark", success: true });
        } else {
            //if bookmark not then save it 
            await user.updateOne({ $addToSet: { bookmark: post._id } });
            await user.save();
            return res.status(200).json({ type: "saved", message: "Post bookmarked", success: true });
        }
    } catch (error) {
        console.log(error);
    }
}

async function getSinglePost(req, res) {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId)
            .populate("author", "username profilePicture")
            .populate({
                path: "comments",
                options: { sort: { createdAt: -1 } },
                populate: { path: "author", select: "username profilePicture" }
            });

        if (!post) return res.status(404).json({ message: "Post not found", success: false });

        return res.status(200).json({ post, success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", success: false });
    }
}

export {
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
}
