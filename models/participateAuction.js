const mongoose = require("mongoose");

const AuctionParticipationSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AuctionParticipation", AuctionParticipationSchema);
