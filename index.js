require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('express-flash');
const multer = require('multer'); // Import multer
const Product = require('./models/product'); // Import the Product model
const dbConnect = require('./database/dbConnect');
const conn = dbConnect();
const User = require('./models/user');
const app = express();

// Set up multer storage options for image upload
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to store uploaded images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique filenames
    }
});

const upload = multer({ storage: multerStorage }); // Create multer instance

app.use(session({
    secret: 'sessionsecret777',
    resave: false,
    saveUninitialized: false,
}));

// Set up essential middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// Serve public assets
app.use('/public/admin', express.static(path.join(__dirname, 'public/admin')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Flash Messages
app.use(flash());

// Attach database instance to request object
app.use((req, res, next) => {
    req.db = conn; 
    next();
});

// Load web routes
require('./routes/web')(app);

// Get user from session
app.use((req, res, next) => {
    if (!req.session.login) {
        return res.redirect('/login');
    }
    next();
});

// Catch-all 404 route
app.use(async (req, res, next) => {
    const userLogin = await User.findById(req.session.login)
    return res.status(404).render('404', {
        login: req.session.login,
        userLogin: userLogin,
    });
});

// Route to handle product submission and image upload
app.post('/farmer/addProduct', upload.single('productImage'), (req, res) => {
    const { category, productType, productName, minPrice, productInfo, auctionStart, auctionEnd } = req.body;
    const productImage = req.file ? req.file.filename : null; // Handle image upload

    // Basic validation to check if required fields are filled
    if (!category || !productType || !productName || !minPrice || !productInfo || !productImage) {
        return res.json({ success: false, message: 'All fields are required' });
    }

    // If wholesale, ensure auction fields are filled
    if (productType === 'wholesale' && (!auctionStart || !auctionEnd)) {
        return res.json({ success: false, message: 'Auction start and end times are required for wholesale products.' });
    }

    // Create the new product object
    const newProduct = new Product({
        category,
        productType,
        productName,
        minPrice,
        productInfo,
        auctionStart,
        auctionEnd,
        productImage
    });

    // Save product to database
    newProduct.save()
        .then(() => {
            res.json({ success: true, message: 'Product added successfully.' });
        })
        .catch(err => {
            res.json({ success: false, message: 'Error adding product: ' + err.message });
        });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
});
