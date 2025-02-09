const SITE_TITLE = 'PAO';
const User = require('../../models/user');
const Category = require('../../models/category');
const Product = require('../../models/product'); // Import Product model
const Notification = require('../../models/notification');
const Order = require('../../models/order');
const Participation = require("../../models/participateAuction");

module.exports.index = async (req, res) => {
    try {
        console.log('Session Data:', req.session);

        // Check if user is logged in
        const userLogin = await User.findById(req.session.login);
        if (!userLogin) {
            req.flash('error', 'Please log in first.');
            return res.redirect('/login');
        }

        // Fetch all categories
        const categories = await Category.find();

        // Fetch all products excluding those that are rejected and populate seller details
        const products = await Product.find({ status: { $ne: 'rejected' } })
            .populate('category', 'name')
            .populate('seller', 'firstName lastName');

        // Fetch the buyer's participation data
        const participations = await Participation.find({ buyer: req.session.login })
            .populate('product', 'name auctionStart auctionEnd image minPrice')
            .populate('seller', 'firstName lastName');

        // Fetch notifications
        const notifications = await Notification.find({ user: userLogin._id, status: 'unread' });

        // Group products by category
        let groupedProducts = [];
        categories.forEach(category => {
            let categoryProducts = products.filter(product =>
                product.category && product.category._id.toString() === category._id.toString()
            );
            groupedProducts.push({
                category: category,
                products: categoryProducts
            });
        });

        // Pass all necessary data to the view
        res.render('buyer/index.ejs', {
            site_title: SITE_TITLE,
            title: 'Home',
            req: req,
            messages: req.flash(),
            userLogin: userLogin,
            buyer: userLogin, // Add this line
            currentUrl: req.originalUrl,
            categories: categories,
            groupedProducts: groupedProducts,
            products: products,
            notifications,
            participations,  // Pass buyer's participation data
        });
    } catch (error) {
        console.error('Error loading buyer dashboard:', error);
        req.flash('error', 'Something went wrong.');
        res.redirect('/login');
    }
};

module.exports.confirmPurchase = async (req, res) => {
    try {
        const { productId, quantity, totalPrice } = req.body;

        if (!productId || !quantity || !totalPrice || isNaN(totalPrice) || totalPrice <= 0) {
            return res.status(400).json({ success: false, message: "Invalid order data." });
        }

        const product = await Product.findById(productId).populate('seller'); // Get seller info
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        // Get buyer details from session (assuming req.session.login contains user ID)
        const buyer = await User.findById(req.session.login);
        if (!buyer) {
            return res.status(404).json({ success: false, message: "Buyer not found." });
        }

        // Save order with seller information
        const order = new Order({
            product: productId,
            seller: product.seller, // Store seller info
            buyer: req.session.login, // Buyer from session
            quantity,
            totalPrice
        });

        await order.save();

        // Create a notification for the seller with buyer's first name and last name
        const notification = new Notification({
            user: product.seller, // Seller ID (Farmer)
            message: `${buyer.firstName} ${buyer.lastName} confirmed a purchase of ${quantity} ${product.name} for ₱${totalPrice}.`,
            status: 'unread'
        });

        await notification.save();

        res.status(200).json({ success: true, message: "Order placed successfully!" });
    } catch (error) {
        console.error("Error confirming purchase:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

module.exports.markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = req.query.notification_id;  // Use query param here
        const notification = await Notification.findById(notificationId);

        if (notification) {
            notification.status = 'read'; // Update the status
            await notification.save();
        }

        // After marking as read, redirect back to the farmer dashboard
        res.redirect('/buyer/index');
    } catch (error) {
        console.error('Error updating notification status:', error);
        req.flash('error', 'Failed to update notification.');
        res.redirect('/buyer/index');
    }
};


module.exports.confirmParticipation = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Invalid auction details." });
        }

        const product = await Product.findById(productId).populate("seller");
        if (!product) {
            return res.status(404).json({ success: false, message: "Auction product not found." });
        }

        // Get buyer details from session
        const buyer = await User.findById(req.session.login);
        if (!buyer) {
            return res.status(404).json({ success: false, message: "Buyer not found." });
        }

        // Save participation in the database
        const participation = new AuctionParticipation({
            product: productId,
            seller: product.seller, // Store seller info
            buyer: req.session.login, // Buyer from session
        });

        await participation.save();

        // Notify the seller (farmer)
        const notification = new Notification({
            user: product.seller, // Farmer ID
            message: `${buyer.firstName} ${buyer.lastName} has joined the auction for ${product.name}.`,
            status: "unread"
        });

        await notification.save();

        res.status(200).json({ success: true, message: "Participation confirmed!" });
    } catch (error) {
        console.error("Error confirming participation:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};