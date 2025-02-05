const SITE_TITLE = 'PAO';
const User = require('../../models/user');
const Category = require('../../models/category');
const Product = require('../../models/product'); // Import Product model
const Notification = require('../../models/notification');
const Order = require('../../models/order');

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
            .populate('category', 'name') // Populate category name
            .populate('seller', 'firstName lastName'); // Populate seller's first and last name

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

        // ✅ Pass `products` along with `groupedProducts`
        res.render('buyer/index.ejs', {
            site_title: SITE_TITLE,
            title: 'Home',
            req: req,
            messages: req.flash(),
            userLogin: userLogin,
            currentUrl: req.originalUrl,
            categories: categories,
            groupedProducts: groupedProducts, // Grouped products by category
            products: products, // ✅ This is needed for "All Products"
            notifications,
        });
    } catch (error) {
        console.error('Error loading buyer dashboard:', error);
        req.flash('error', 'Something went wrong.');
        res.redirect('/login');
    }
};



module.exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category', 'name')
            .populate('seller', 'firstName lastName'); // ✅ Ensure seller details are populated

        // Verify if products have seller populated
        console.log(products); // Log products to check if the seller is being populated correctly

        res.render('buyer/products', { products }); // Pass products to the view
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Server Error');
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

        // Save order with seller information
        const order = new Order({
            product: productId,
            seller: product.seller, // Store seller info
            buyer: req.session.login, // Buyer from session
            quantity,
            totalPrice
        });

        await order.save();

        res.status(200).json({ success: true, message: "Order placed successfully!" });
    } catch (error) {
        console.error("Error confirming purchase:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};