const Product = require('../../models/product');
const multer = require('multer');
var fileUpload = require("../../middlewares/product-upload-middleware.js");
const path = require('path');

// Set up Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/img/product'); // Folder for product images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage: storage });

// Add Product Controller
module.exports.addProduct = async (req, res) => {
    try {
        const { category, productName, minPrice, productInfo, productType, auctionStart, auctionEnd } = req.body;

        // Create Product object
        const product = new Product({
            category,
            productName,
            minPrice,
            productInfo,
            productType,
            farmer: req.session.userId, // Assume farmer ID is in session
            imageUrl: req.file ? `/public/img/product/${req.file.filename}` : null,
            ...(productType === 'auction' && { auctionStart, auctionEnd }),
        });

        // Save product to database
        await product.save();
        res.redirect('/farmer/index'); // Redirect to farmer's product page
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).send('Internal Server Error');
    }
};

// Middleware to handle file upload
module.exports.upload = upload.single('productImage');
