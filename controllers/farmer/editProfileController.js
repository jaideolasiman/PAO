const express = require("express");
const router = express.Router();
const User = require("../../models/user"); // Import User model
const bcrypt = require("bcrypt"); // For password hashing
const path = require("path");
const fs = require("fs");

// Edit Profile Functionality (including password update)
exports.editProfile = async (req, res) => {
    try {
        const userId = req.session.userId; // Get user ID from session (or req.user if using Passport.js)
        if (!userId) {
            return res.redirect("/login"); // Redirect if not logged in
        }

        const userLogin = await User.findById(userId); // Fetch user data
        if (!userLogin) {
            return res.status(404).send("User not found");
        }

        res.render("profile", { userLogin }); // Send userLogin data to EJS
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};


exports.updateProfile = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userId = req.params.id;

        const userLogin = await User.findById(userId);
        if (!userLogin) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        userLogin.username = username;
        userLogin.email = email;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            userLogin.password = await bcrypt.hash(password, salt);
        }

        await userLogin.save();
        res.json({ success: true, message: "Profile updated successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

