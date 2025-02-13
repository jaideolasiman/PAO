const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Buyer
  message: String,
  status: { type: String, default: "unread" }, // unread or read
  createdAt: { type: Date, default: Date.now },
  replies: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Buyer ID
      message: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Notification", notificationSchema);
