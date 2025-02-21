const SITE_TITLE = "PAO";
const User = require("../../models/user");
const Category = require("../../models/category");
const Product = require("../../models/product"); // Import Product model
const Notification = require("../../models/notification");
const Order = require("../../models/order");
const AuctionParticipation = require("../../models/participateAuction.js");
const AuctionSession = require("../../models/auctionSession");

module.exports.index = async (req, res) => {
  try {
    console.log("Session Data:", req.session);

    // Check if user is logged in
    const userLogin = await User.findById(req.session.login);
    if (!userLogin) {
      req.flash("error", "Please log in first.");
      return res.redirect("/login");
    }

    // Fetch all categories
    const categories = await Category.find();

    // Fetch only approved products and populate seller details
    const products = await Product.find({ status: "approved" })
      .populate("category", "name") // Populate category name
      .populate("seller", "firstName lastName"); // Populate seller details

    // Log retrieved products for debugging
    if (!products.length) {
      console.log("No approved products found.");
    } else {
      console.log("Fetched Products:");
    }

    // Separate products by type
    const retailProducts = products.filter(
      (product) => product.productType.toLowerCase() === "retail"
    );
    const wholesaleProducts = products.filter(
      (product) => product.productType.toLowerCase() === "wholesale"
    );

    // Group products by category
    const groupedProducts = categories.map((category) => ({
      category,
      retailProducts: retailProducts.filter(
        (product) =>
          product.category && product.category._id.toString() === category._id.toString()
      ),
      wholesaleProducts: wholesaleProducts.filter(
        (product) =>
          product.category && product.category._id.toString() === category._id.toString()
      ),
    }));

    // Fetch unread notifications
    const notifications = await Notification.find({
      user: userLogin._id,
      status: "unread",
    });

    // Render EJS with corrected groupedProducts
    res.render("buyer/index.ejs", {
      site_title: SITE_TITLE,
      title: "Home",
      req: req,
      messages: req.flash(),
      userLogin,
      currentUrl: req.originalUrl,
      categories,
      groupedProducts,
      retailProducts,
      wholesaleProducts,
      notifications,
    });

  } catch (error) {
    console.error("Error loading buyer dashboard:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("/login");
  }
};


module.exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("seller", "firstName lastName"); // ✅ Ensure seller details are populated

    // Verify if products have seller populated
    console.log(products); // Log products to check if the seller is being populated correctly

    res.render("buyer/products", { products }); // Pass products to the view
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Server Error");
  }
};


module.exports.confirmPurchase = async (req, res) => {
  try {
    const { productId, quantity, totalPrice } = req.body;

    if (
      !productId ||
      !quantity ||
      !totalPrice ||
      isNaN(totalPrice) ||
      totalPrice <= 0
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order data." });
    }

    const product = await Product.findById(productId).populate("seller"); // Get seller info
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    // Get buyer details from session (assuming req.session.login contains user ID)
    const buyer = await User.findById(req.session.login);
    if (!buyer) {
      return res
        .status(404)
        .json({ success: false, message: "Buyer not found." });
    }

    // Save order with seller information
    const order = new Order({
      product: productId,
      seller: product.seller, // Store seller info
      buyer: req.session.login, // Buyer from session
      phoneNumber: buyer.phoneNumber,
      quantity,
      totalPrice,
    });

    await order.save();

    // Create a notification for the seller with buyer's first name and last name
    const notification = new Notification({
      user: product.seller, // Seller ID (Farmer)
      message: `${buyer.firstName} ${buyer.lastName} confirmed a purchase of ${quantity} ${product.name} for ₱${totalPrice}.`,
      status: "unread",
    });

    await notification.save();

    res
      .status(200)
      .json({ success: true, message: "Order placed successfully!" });
  } catch (error) {
    console.error("Error confirming purchase:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports.markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.query.notification_id; // Use query param here
    const notification = await Notification.findById(notificationId);

    if (notification) {
      notification.status = "read"; // Update the status
      await notification.save();
    }

    // After marking as read, redirect back to the farmer dashboard
    res.redirect("/buyer/index");
  } catch (error) {
    console.error("Error updating notification status:", error);
    req.flash("error", "Failed to update notification.");
    res.redirect("/buyer/index");
  }
};

module.exports.confirmParticipation = async (req, res) => {
  try {
    const { productId } = req.body;
    console.log("product", req.body);
    if (!productId) {
      req.flash("error", "Invalid auction details.");
      return res.redirect("/buyer/index");
    }

    const product = await Product.findById(productId).populate("seller");
    if (!product) {
      req.flash("error", "Auction product not found.");
      return res.redirect("/buyer/index");
    }

    // Check if the auction has ended
    const auctionEndTime = new Date(product.auctionEnd);
    const currentTime = new Date();
    if (currentTime >= auctionEndTime) {
      req.flash("error", "Auction has already ended.");
      return res.redirect("/buyer/index");
    }

    // Get buyer details from session
    const buyer = await User.findById(req.session.login);
    if (!buyer) {
      req.flash("error", "Buyer not found.");
      return res.redirect("/buyer/index");
    }
    const checkParticipation = await AuctionParticipation.findOne({
      product: productId,
      buyer: req.session.login,
    });
    if (checkParticipation) {
      req.flash("success", "You already participated to this Product .");
      return res.redirect("/buyer/index");
    }

    // Save participation in the database
    const participation = new AuctionParticipation({
      product: productId,
      seller: product.seller,
      buyer: req.session.login,
    });

    await participation.save();

    // Notify the seller (farmer)
    const notification = new Notification({
      user: product.seller,
      message: `${buyer.firstName} ${buyer.lastName} has joined the auction for ${product.name}.`,
      status: "unread",
    });

    await notification.save();

    req.flash(
      "success",
      `You have successfully joined the auction for ${product.name} you can join and bid an higher amount when the sched was arise update you currently .`
    );
    res.redirect("/buyer/index");
  } catch (error) {
    console.error("Error confirming participation:", error);
    req.flash("error", "Server error.");
    res.redirect("/buyer/index");
  }
};

module.exports.getCurrentBids = async (req, res) => {
  try {
    const userLogin = await User.findById(req.session.login);
    if (!userLogin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const now = new Date();
    //console.log("now", now);
    const participatedBids = await AuctionParticipation.find({
      buyer: userLogin._id,
    })
      .populate("buyer")
      .populate("product")
      .populate("seller");
    // console.log("a", participatedBids);
    // .populate({
    //     path: 'auctionSession', // Use the correct field name
    //     match: { auctionStart: { $lte: now }, auctionEnd: { $gte: now } },
    //     populate: { path: 'seller', select: 'firstName lastName' }
    // });

    // const filteredBids = participatedBids.filter(bid => bid.product !== null);
    const formattedBids = participatedBids
      .map((bid) => {
        //   console.log("BID.PRODUCT:", bid?.product); // Check if product exists
        if (!bid?.product) return false; // Skip if product is missing
        // Get current PH date
        const now = new Date();
        const phTime = new Date(
          now.toLocaleString("en-US", { timeZone: "Asia/Manila" })
        );

        // Convert dates to YYYYMMDD format (for correct numeric comparison)
        const formatDateToNumber = (date) => {
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const year = String(date.getFullYear());
          return parseInt(`${year}${month}${day}`); // Convert to number
        };

        const nowNumber = formatDateToNumber(phTime);
        const auctionStartNumber = formatDateToNumber(bid.product.auctionStart);
        const auctionEndNumber = formatDateToNumber(bid.product.auctionEnd);

        console.log(
          `Now: ${nowNumber}, Start: ${auctionStartNumber}, End: ${auctionEndNumber}`
        );
        // Compare dates numerically (YYYYMMDD format)
        if (auctionEndNumber >= nowNumber) {
          if (auctionStartNumber <= nowNumber) {
            //   console.log('bid', bid.product.image)
            return {
              // kulang id
              pId: bid._id ?? "",
              productId: bid.product._id ?? "",
              productName: bid.product.name || "N/A",
              productDescription: bid.product.productInfo || "N/A",
              productImage: bid.product.image || "",
              minimumPrice: bid.product.minPrice || 0,
              auctionStart: auctionStartNumber,
              auctionEnd: auctionEndNumber,
              sellerName: `${bid.seller?.firstName || ""} ${
                bid.seller?.lastName || ""
              }`.trim(),
            };
          }
        }

        return false; // Exclude if auction is not active
      })
      .filter(Boolean);
    console.log("a", formattedBids);
    res.json({ success: true, bids: formattedBids });
  } catch (error) {
    console.error("Error fetching current bids:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.getNotifications = async (req, res) => {
  try {
    const userLogin = await User.findById(req.session.login);
    if (!userLogin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const notifications = await Notification.find({ user: userLogin._id }).sort(
      { createdAt: -1 }
    );

    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
