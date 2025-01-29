const Product = require('../../models/product');
const Category = require('../../models/category');
const User = require('../../models/user');
const SITE_TITLE = 'PAO';

module.exports.index = async (req, res) => {
    try {
        console.log('Session Data:', req.session);

        const userLogin = await User.findById(req.session.login);
        const categories = await Category.find();

        if (userLogin) {
            res.render('farmer/index.ejs', {
                site_title: SITE_TITLE,
                title: 'Home',
                session: req.session,
                categories,
                userLogin,
                messages: req.flash(),
                currentUrl: req.originalUrl,
            });
        } else {
            req.flash('error', 'Please log in first.');
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('Error loading farmer dashboard:', error);
        req.flash('error', 'Something went wrong.');
        res.redirect('/login');
    }
};

exports.addProduct = async (req, res) => {
    try {
      const { productImage, productInfo, minPrice, productType, productName, category } = req.body;
  
      // Ensure all required fields are present
      if (!productImage || !productInfo || !minPrice || !productType || !productName || !category) {
        return res.status(400).send("All fields are required.");
      }
  
      const newProduct = new Product({
        productImage,
        productInfo,
        minPrice,
        productType,
        productName,
        category
      });
  
      await newProduct.save();
      res.status(201).send("Product added successfully!");
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong while adding the product.");
    }
  };