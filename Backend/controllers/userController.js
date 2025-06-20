import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js"
import cloudinary from "../utils/cloudinary.js";

async function register(req, res) {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Something is missing, please check!",
                success: false
            });
        }
        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({
                message: "Try different email",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword
        });
        return res.status(201).json({
            message: "Account created successfully",
            success: true
        });

    } catch (error) {
        console.log(error);
    }
}

async function login(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false
            });
        }

        let user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                message: "Invalid username or password",
                success: false
            });
        }

        const isPassword = await bcrypt.compare(password, user.password);
        if (!isPassword) {
            return res.status(401).json({
                message: "Invalid username or password",
                success: false
            });
        }

        // generating the token
        const token = await jwt.sign({ userId: user._id, userName: user.username }, process.env.JWT_SECERT, { expiresIn: "1d" });

        //populate each post if in the posts array 
        const populatedPosts = await Promise.all(
            user.posts.map(async (postId) => {
                const post = await Post.findById(postId);
                if (post.author.equals(user._id)) {
                    return post;
                }
                return null;
            })
        )
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts
        }


        return res.cookie("token", token, { httpOnly: true, sameSite: "strict", maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `welcome back ${user.username}`,
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
}

async function resetPassword(req, res) {
    try {
        const { username, newPassword, confirmPassword } = req.body;

        if (!username || !newPassword || !confirmPassword)
            return res.status(400).json({ message: "All fields are required" });

        if (newPassword !== confirmPassword)
            return res.status(400).json({ message: "Passwords do not match" });

        const user = await User.findOne({ username });
        if (!user)
            return res.status(404).json({ message: "User not found" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();


        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function logout(req, res) {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully",
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

async function getProfile(req, res) {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).populate({ path: "posts", createdAt: -1 }).populate("bookmark");
        return res.status(200).json({ user, success: true });
    } catch (error) {
        console.log(error);
        console.error("GetProfile Error:", error);
        return res.status(500).json({ message: "Server error", success: false });
    }
}

async function editProfile(req, res) {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.stats(404).json({
                message: "User not found",
                success: false
            })
        }

        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();
        return res.status(200).json({
            message: "Profile Updated",
            success: true,
            user
        })
    } catch (error) {
        console.log(error);
    }
}

async function getSuggestedUser(req, res) {
    try {
        const suggestedUser = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUser) {
            return res.status(400).json({ message: "Currently do not have any users" });
        }
        return res.status(200).json({ success: true, users: suggestedUser });
    } catch (error) {
        console.log(error);
    }
}

async function followOrUnfollow(req, res) {
    try {
        const followkarneWala = req.id;
        const jiskoFollowkarunga = req.params.id;
        if (followkarneWala == jiskoFollowkarunga) {
            return res.status(400).json({
                message: "You cannot follow/unfollow yourself",
                success: false
            });
        }

        const user = await User.findById(followkarneWala);
        const targetUser = await User.findById(jiskoFollowkarunga);
        if (!user || !targetUser) {
            return res.status(400).json({
                message: "User not found",
                success: false
            });
        }

        const isfollowing = user.following.includes(jiskoFollowkarunga);
        if (isfollowing) {
            await Promise.all([
                User.updateOne({ _id: followkarneWala }, { $pull: { following: jiskoFollowkarunga } }),
                User.updateOne({ _id: jiskoFollowkarunga }, { $pull: { followers: followkarneWala } }),
            ])
            return res.status(200).json({ message: "Unfollowed successfullt", success: true, type: "unfollowed" });
        } else {
            await Promise.all([
                User.updateOne({ _id: followkarneWala }, { $push: { following: jiskoFollowkarunga } }),
                User.updateOne({ _id: jiskoFollowkarunga }, { $push: { followers: followkarneWala } }),
            ])
            return res.status(200).json({ message: "followed successfullt", success: true, type: "followed" });
        }
    } catch (error) {
        console.log(error);

    }
}

export {
    register,
    login,
    logout,
    getProfile,
    editProfile,
    getSuggestedUser,
    followOrUnfollow,
    resetPassword
}
