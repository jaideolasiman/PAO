const SITE_TITLE = "PAO";
const User = require("../../models/user");
const Category = require("../../models/category");
const Product = require("../../models/product"); // Import Product model
const Notification = require("../../models/notification");
const Order = require("../../models/order");
const AuctionParticipation = require("../../models/participateAuction.js");
const AuctionSession = require("../../models/auctionSession");
const mongoose = require('mongoose')

module.exports.index = async (req, res) => {
  try {
    console.log("Session Data:", req.session);

    // Check if user is logged in
    const userLogin = await User.findById(req.session.login);
    if (!userLogin) {
      req.flash("error", "Please log in first.");
      return res.redirect("/login");
    }
    console.log('req.params.id:', req.params)
    // Fetch auction product details
//     const product = await Product.findOne({
//       _id: req.params.productId,
//       status: "approved",
//     }).populate("seller", "firstName lastName");
// // AuctionSession
//     if (!product) {
//       req.flash("error", "Auction not found or has ended.");
//       return res.redirect("/buyer");
//     }

    const participation = await AuctionParticipation.findById(req.params.productId).populate('product').populate('buyer').populate('seller').lean();
    console.log("Participation:", participation);
    const auctionSessioned = await AuctionSession.find({
        product: participation.product._id,
        seller: participation.seller._id
      }).populate('buyer').populate('seller').populate('product').lean(); // Use .lean() for better performance if only reading data
      
      // Extract all bids from the auction sessions
      const allBids = auctionSessioned.flatMap(session => session || []);
      
      // Sort bids by bid amount in descending order (highest first)
      const topBids = allBids
      .map(bid => ({ ...bid, bid: Number(bid.bid) })) // Convert bid to a number
      .sort((a, b) => b.bid - a.bid) // Sort from highest to lowest
    

console.log("🏆 Top Bids:", topBids);
 // Get top 5
      
      console.log("Top 3 Highest Bids:", topBids);
      

    /**
     * what we need to do is filter this auctionSessioned.bid to the highest bid.
     * 1. result will only return 3 highest
     */


    // Fetch unread notifications
    const notifications = await Notification.find({
      user: userLogin._id,
      status: "unread",
    });

    res.render("buyer/AuctionSessionRoom.ejs", {
      site_title: "Auction Session",
      title: "Auction Room",
      req: req,
      messages: req.flash(),
      userLogin,
      topBids,
      currentUrl: req.originalUrl,
      product: participation.product,
      participation,
      notifications,
    });
  } catch (error) {
    console.error("Error loading Auction Session Room:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("/buyer");
  }
};

module.exports.doBid = async (req, res) => {
  try {
    console.log("Session Data:", req.session);
    console.log("req", req.body);
    console.log("req", req.params.productId);
    // // Check if user is logged in
    const userLogin = await User.findById(req.session.login);
    if (!userLogin) {
      req.flash("error", "Please log in first.");
      return res.redirect("/login");
    }

    // // Fetch auction product details
    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(req.body.productId),
      status: "approved",
    }).populate("seller", "firstName lastName");

    if (!product) {
      req.flash("error", "Auction not found or has ended.");
      return res.redirect("/buyer");
    }
    const b = req.body
    /**
     * before doing save
     * 1. check if already have a bid price
     * 2. return false if duplicated
     */
    const a = new AuctionSession({
      product: b.productId,
      seller: b.sellerId,
      buyer: userLogin._id,
      bid: b.submitPrice
    });

    await a.save()
    // // Fetch the buyer's participation data
    // const participation = await Participation.findOne({ buyer: req.session.login, product: req.params.productId });
    res.redirect(`/buyer/auction/room/${req.params.productId}`)
    // // Fetch unread notifications
    // const notifications = await Notification.find({ user: userLogin._id, status: "unread" });
  } catch (error) {
    console.error("Error loading Auction Session Room:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("/buyer");
  }
};
