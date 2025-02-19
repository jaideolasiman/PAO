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

    console.log('req.params.id:', req.params);

    // Fetch auction participation details
    const participation = await AuctionParticipation.findById(req.params.productId)
      .populate('product') // Ensure product is populated
      .populate('buyer')
      .populate('seller')
      .lean();

    if (!participation || !participation.product) {
      req.flash("error", "Auction not found or has ended.");
      return res.redirect("/buyer");
    }

    console.log("Participation:", participation);

    // Fetch auction session details
    const auctionSessioned = await AuctionSession.find({
      product: participation.product._id,
      seller: participation.seller._id
    })
      .populate('buyer')
      .populate('seller')
      .populate('product')
      .lean();

    // Extract all bids from the auction sessions
    const allBids = auctionSessioned.flatMap(session => session || []);
    
    // Sort bids by bid amount in descending order (highest first)
    const topBids = allBids
      .map(bid => ({ ...bid, bid: Number(bid.bid) })) // Convert bid to a number
      .sort((a, b) => b.bid - a.bid); // Sort from highest to lowest

    console.log("🏆 Top Bids:", topBids);
    console.log("Top 3 Highest Bids:", topBids.slice(0, 3));

    // Extract auction start and end time
    const auctionStart = participation.product.auctionStart;
    const auctionEnd = participation.product.auctionEnd;

    console.log("Auction Start:", auctionStart);
    console.log("Auction End:", auctionEnd);

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
      auctionStart, // Pass to the view
      auctionEnd,   // Pass to the view
      sellerFirstName: participation.seller.firstName || 'N/A',
      sellerLastName: participation.seller.lastName || 'N/A'
      
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
    console.log("req.params.productId:", req.params.productId); // Log the productId in the route params

    // Check if user is logged in
    const userLogin = await User.findById(req.session.login);
    if (!userLogin) {
      req.flash("error", "Please log in first.");
      return res.redirect("/login");
    }

    // Fetch auction product details using req.params.productId
    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(req.params.productId),
      status: "approved",
    }).populate("seller", "firstName lastName");

    if (!product) {
      req.flash("error", "Auction not found or has ended.");
      return res.redirect("/buyer");
    }

    // Get the highest bid so far (if any)
    const highestBid = await AuctionSession.findOne({ product: req.params.productId }).sort({ bid: -1 });

    const submittedPrice = parseFloat(req.body.submitPrice);

    // Check if the submitted price is higher than the highest bid or the minimum price
    if (submittedPrice <= (highestBid ? highestBid.bid : product.minPrice)) {
      req.flash("error", "Your bid must be higher than the current bid.");
      return res.redirect(`/buyer/auction/room/${req.params.productId}`);
    }

    // Save the new bid
    const newBid = new AuctionSession({
      product: req.params.productId,
      seller: req.body.sellerId,
      buyer: userLogin._id,
      bid: submittedPrice,
    });

    await newBid.save();

    req.flash("success", "Your bid has been placed successfully!");
    return res.redirect(`/buyer/auction/room/${req.params.productId}`);
  } catch (error) {
    console.error("Error placing bid:", error);
    req.flash("error", "Something went wrong with placing your bid.");
    res.redirect(`/buyer/auction/room/${req.params.productId}`);
  }
};

