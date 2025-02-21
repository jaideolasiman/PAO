const mongoose = require('mongoose');

// Define the highest bid 
const highestBid = new mongoose.Schema({
    amount: { type: Number, default: 0 },
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { _id: true });  // Prevents unnecessary _id for this subdocument

// Define the main auction session 
const auctionSession = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bid: { type: String, ref: 'User', required: true },
    highestBid: { type: highestBid, default: () => ({ amount: 0, bidder: null }) }
}, { timestamps: true });  // Automatically adds createdAt and updatedAt fields
    
// Create the AuctionSession model
const AuctionSession = mongoose.model('AuctionSession', auctionSession);

module.exports = AuctionSession;
