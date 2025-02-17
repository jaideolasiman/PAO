const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const User = require("../../models/user");
const Category = require("../../models/category");
const Product = require("../../models/product");
const upload = require("../../middlewares/uploads");
const Notification = require("../../models/notification");
const Order = require("../../models/order");

const SITE_TITLE = "PAO";

module.exports.index = async (req, res) => {
  try {
    const userLogin = await User.findById(req.session.login);
    if (!userLogin) {
      req.flash("error", "Please log in first.");
      return res.redirect("/login");
    }

    const categories = await Category.find();

    // Fetch only the products added by the logged-in farmer and exclude rejected ones
    const products = await Product.find({
      seller: req.session.login,
      status: { $ne: "rejected" },
    });

    // Separate products by type
    const retailProducts = products.filter(
      (product) => product.productType === "retail"
    );
    const wholesaleProducts = products.filter(
      (product) => product.productType === "wholesale"
    );

    // Group products by category
    const groupedProducts = categories.map((category) => ({
      category,
      retailProducts: retailProducts.filter(
        (product) => product.category.toString() === category._id.toString()
      ),
      wholesaleProducts: wholesaleProducts.filter(
        (product) => product.category.toString() === category._id.toString()
      ),
    }));

    // ✅ If there's a notification ID in the query, update it to "read"
    if (req.query.notification_id) {
      await Notification.findByIdAndUpdate(req.query.notification_id, {
        status: "read",
      });
    }

    // Fetch unread notifications
    const notifications = await Notification.find({ user: req.session.login });

    res.render("farmer/index.ejs", {
      site_title: SITE_TITLE,
      title: "Home",
      session: req.session,
      categories,
      userLogin,
      groupedProducts,
      retailProducts,
      wholesaleProducts,
      messages: req.flash(),
      currentUrl: req.originalUrl,
      notifications,
    });
  } catch (error) {
    console.error("Error loading farmer dashboard:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("/login");
  }
};

module.exports.addProduct = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("/farmer/index");
    }

    if (!req.file) {
      req.flash("error", "Please upload a product image.");
      return res.redirect("/farmer/index");
    }

    const {
      category,
      productType,
      name,
      minPrice,
      productInfo,
      auctionStart,
      auctionEnd,
      pickupAddress,
    } = req.body;

    if (
      !category ||
      !productType ||
      !name ||
      !minPrice ||
      !productInfo ||
      !pickupAddress
    ) {
      req.flash("error", "All fields, including pickup address, are required.");
      return res.redirect("/farmer/index");
    }

    try {
      const productImagePath = "/img/product/" + req.file.filename;

      // Create a new product with status "pending"
      const newProduct = new Product({
        category,
        productType,
        name,
        minPrice,
        productInfo,
        image: productImagePath,
        seller: req.session.login,
        pickupAddress,
        auctionStart: productType === "wholesale" ? auctionStart || null : null,
        auctionEnd: productType === "wholesale" ? auctionEnd || null : null,
        status: "pending", // ✅ Default status: pending approval
      });

      await newProduct.save();

      console.log("New product added, awaiting admin approval:", newProduct);

      req.flash(
        "success",
        `Product submitted for approval. Awaiting admin review.`
      );
      res.redirect("/farmer/index");
    } catch (error) {
      console.error("Error saving product:", error);
      req.flash("error", "Error saving product: " + error.message);
      res.redirect("/farmer/index");
    }
  });
};

module.exports.getBuyers = async (req, res) => {
  try {
    // Find orders where the product belongs to the farmer
    const orders = await Order.find({})
      .populate("buyer", "name")
      .populate("product", "name");

    if (!orders || orders.length === 0) {
      return res.json([]);
    }

    const buyerData = orders.map((order) => ({
      _id: order._id,
      buyerName: order.buyer.name,
      productName: order.product.name, // Ensure this is the correct field in your Product schema
      quantity: order.quantity,
      status: order.status,
    }));

    res.json(buyerData);
  } catch (error) {
    console.error("Error fetching buyers:", error);
    res.status(500).json({ error: "Server error" });
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
    res.redirect("/farmer/index");
  } catch (error) {
    console.error("Error updating notification status:", error);
    req.flash("error", "Failed to update notification.");
    res.redirect("/farmer/index");
  }
};

module.exports.getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.session.login; // Farmer's ID

    if (!farmerId) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    // Fetch orders where the product belongs to the farmer
    const orders = await Order.find({})
      .populate({
        path: "product",
        match: { seller: farmerId },
        select: "name seller status", // Ensure seller is included
      })
      .populate("buyer", "firstName lastName email"); // Fetch buyer details

    // Debugging output
    console.log(
      "Orders with populated buyer:",
      JSON.stringify(orders, null, 2)
    );

    // Filter out orders where product.seller does not match farmerId
    const farmerOrders = orders.filter(
      (order) =>
        order.product && order.product.seller.toString() === farmerId.toString()
    );

    // Map filtered orders to a clean format
    const ordersData = farmerOrders.map((order) => ({
      _id: order._id,
      buyerName: order.buyer
        ? `${order.buyer.firstName} ${order.buyer.lastName}`
        : "Unknown Buyer", // Fix missing name issue
      productName: order.product ? order.product.name : "Unknown Product",
      quantity: order.quantity,
      totalPrice: order.totalPrice, // ✅ Added total price
      status: order.status,
    }));

    res.json(ordersData);
  } catch (error) {
    console.error("Error fetching farmer orders:", error);
    res.status(500).json({ error: "Server error." });
  }
};

module.exports.processOrder = async (req, res) => {
  const { orderId, action } = req.body;

  try {
    const updatedStatus = action === "approve" ? "Approved" : "Rejected";

    // ✅ Find and update the order
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: updatedStatus },
      { new: true }
    ).populate("product"); // Ensure we get the product details

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Ensure the order has a product before sending the notification
    if (!order.product) {
      return res
        .status(400)
        .json({ message: "Order does not have a valid product." });
    }

    // ✅ Create notification for the buyer if the order is approved
    if (updatedStatus === "Approved") {
      const notification = new Notification({
        user: order.buyer, // Buyer ID
        message: `Your order for '${order.product.name}' has been approved by the seller. Your order is ready to pick up.`,
        status: "unread",
      });

      await notification.save();
    }

    res.json({ message: `Order ${updatedStatus.toLowerCase()} successfully!` });
  } catch (error) {
    console.error("❌ Error processing order:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports.showBuyer = async (req, res) => {
    try {
        const productId = req.query.productId;
        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        // Fetch orders for the given productId
        const orders = await Order.find({ product: productId }).populate('buyer', 'firstName lastName');
console.log('b',orders)
        // Extract buyer details
        const buyers = orders.map(order => ({
            firstName: order.buyer ? order.buyer.firstName : "Unknown",
            lastName: order.buyer ? order.buyer.lastName : "Buyer"
        }));

        // Send JSON response instead of rendering a new page
        return res.json({ buyers });

    } catch (error) {
        console.error("Error fetching buyers:", error);
        return res.status(500).json({ error: "Server error" });
    }
};
module.exports.showParticipated = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.session.login })
      .populate("product", "name seller")
      .populate("seller", "name email");

    if (!orders.length) {
      return res.status(404).json({ message: "No participated orders found." });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching participated orders:", error);
    res.status(500).json({ error: "Server error" });
  }
};
