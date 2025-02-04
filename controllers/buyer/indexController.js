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
        console.log("Request received:", req.body);  // ✅ Log the request data

        const { productId, quantity } = req.body;

        // Validate user login
        const buyer = await User.findById(req.session.login);
        if (!buyer) {
            console.error("User not logged in");
            return res.status(401).json({ success: false, message: 'User not logged in' });
        }

        // Validate product
        const product = await Product.findById(productId).populate('seller');
        if (!product) {
            console.error("Product not found:", productId);
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Debugging logs
        console.log("Buyer:", buyer);
        console.log("Product:", product);

        // Calculate total price
        const totalPrice = product.minPrice * quantity;

        // Create new order
        const newOrder = new Order({
            buyer: buyer._id,
            seller: product.seller._id,
            product: product._id,
            quantity,
            totalPrice
        });

        await newOrder.save();
        console.log("Order saved:", newOrder);

        // Create notification for the seller
        const newNotification = new Notification({
            user: product.seller._id,
            message: `New order: ${buyer.firstName} purchased ${quantity}kg of ${product.name}.`,
            status: 'unread'
        });

        await newNotification.save();
        console.log("Notification saved:", newNotification);

        res.json({ success: true, message: 'Purchase confirmed and seller notified' });

    } catch (error) {
        console.error('Error confirming purchase:', error);  // ✅ Show error details
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};