import {v2 as cloudinary} from "cloudinary";
import bcrypt from "bcryptjs";
//models
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (!userToModify || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (id === req.user._id) {
      return res
        .status(400)
        .json({ error: "You can't follow/unfollow yourself" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({ message: "User unfollowed successfully" });

      // const newNotification = new Notification({
      //     type:"follow",
      //     from:req.user._id,
      //     to:userToModify._id
      // });

      // await newNotification.save();
    } else {
      // Follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      res.status(200).json({ message: "User followed successfully" });
      // Send notification to the user (implement notification logic here)

      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotification.save();
    }
  } catch (error) {
    console.log("Error in followUnfollowUser", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSuggetsedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const userFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);

    const filteredUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getsuggestedUsers", error.message);
    res.status(400).json({ error: error.message });
  }
};


export const updateUser = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate passwords
    if ((newPassword && !currentPassword) || (!newPassword && currentPassword)) {
      return res
        .status(400)
        .json({ error: "Please provide both current password and new password" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Update profile image
    if (profileImg) {
      try {
        if (user.profileImg) {
          const publicId = user.profileImg.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
        const uploadedResponse = await cloudinary.uploader.upload(profileImg);
        profileImg = uploadedResponse.secure_url;
      } catch (err) {
        console.error("Failed to update profile image:", err.message);
        return res.status(500).json({ error: "Failed to update profile image" });
      }
    }

    // Update cover image
    if (coverImg) {
      try {
        if (user.coverImage) { // Adjusted to match schema field name
          const publicId = user.coverImage.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
        const uploadedResponse = await cloudinary.uploader.upload(coverImg);
        coverImg = uploadedResponse.secure_url;
        user.coverImage = coverImg; // Adjusted to match schema field name
      } catch (err) {
        console.error("Failed to update cover image:", err.message);
        return res.status(500).json({ error: "Failed to update cover image" });
      }
    }

    // Update user fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;

    
    const updatedUser = await user.save();

    return res.status(200).json({
      ...updatedUser.toObject(),
      password: null, // Exclude password from response
    });
  } catch (error) {
    console.error("Something went wrong in updateUser:", error.message);
    return res.status(400).json({ error: "Something went wrong" });
  }
};
