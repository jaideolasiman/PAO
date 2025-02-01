const SITE_TITLE = 'PAO';
const User = require('../../models/user');
const Category = require('../../models/category');
const Product = require('../../models/product'); // Import Product model

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

        // Fetch all products and populate their category details
        const products = await Product.find().populate('category');

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
            products: products // ✅ This is needed for "All Products"
        });
    } catch (error) {
        console.error('Error loading buyer dashboard:', error);
        req.flash('error', 'Something went wrong.');
        res.redirect('/login');
    }
};
