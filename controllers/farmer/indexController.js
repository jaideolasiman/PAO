const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const User = require('../../models/user');
const Category = require('../../models/category');
const Product = require('../../models/product');
const upload = require('../../middlewares/uploads'); // Import the multer middleware


const SITE_TITLE = 'PAO';

module.exports.index = async (req, res) => {
  try {
      const userLogin = await User.findById(req.session.login);
      const categories = await Category.find();
      const products = await Product.find();  // Fetch all products

      // Group products by category
      const groupedProducts = categories.map(category => ({
          category,
          products: products.filter(product => product.category.toString() === category._id.toString())
      }));

      if (userLogin) {
          res.render('farmer/index.ejs', {
              site_title: SITE_TITLE,
              title: 'Home',
              session: req.session,
              categories,
              userLogin,
              groupedProducts,  // Pass grouped products
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



module.exports.addProduct = (req, res) => {
  upload(req, res, async (err) => {
      if (err) {
          req.flash('error', err.message);
          return res.redirect('/farmer/index');
      }

      if (!req.file) {
          req.flash('error', 'Please upload a product image.');
          return res.redirect('/farmer/index');
      }

      // Ensure all required fields are present
      const { category, productType, name, minPrice, productInfo } = req.body;

      if (!category || !productType || !name || !minPrice || !productInfo) {
          req.flash('error', 'All fields are required.');
          return res.redirect('/farmer/index');
      }

      try {
          // Set the correct image path
          const productImagePath = '/img/product/' + req.file.filename;

          // Create new product
          const newProduct = new Product({
              category,
              productType,
              name,
              minPrice,
              productInfo,
              image: productImagePath,  // Save the image path in the databasea
              farmer: name
          });

          // Save the product to the database
          await newProduct.save();

          // Log the new product
          console.log('New product saved:', newProduct);

          // Flash success message and redirect
          req.flash('success', 'Product added successfully!');
          res.redirect('/farmer/index');
      } catch (error) {
          console.error('Error saving product:', error);
          req.flash('error', 'Error saving product: ' + error.message);
          res.redirect('/farmer/index');
      }
  });
};