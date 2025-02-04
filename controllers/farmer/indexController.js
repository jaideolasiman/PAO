const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const User = require('../../models/user');
const Category = require('../../models/category');
const Product = require('../../models/product');
const upload = require('../../middlewares/uploads');
const Notification = require('../../models/notification');

const SITE_TITLE = 'PAO';

module.exports.index = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (!userLogin) {
            req.flash('error', 'Please log in first.');
            return res.redirect('/login');
        }

        const categories = await Category.find();
        
        // Fetch only the products added by the logged-in farmer and exclude rejected ones
        const products = await Product.find({ seller: req.session.login, status: { $ne: 'rejected' } });

        // Group products by category
        const groupedProducts = categories.map(category => ({
            category,
            products: products.filter(product => product.category.toString() === category._id.toString())
        }));

        // ✅ If there's a notification ID in the query, update it to "read"
        if (req.query.notification_id) {
            await Notification.findByIdAndUpdate(req.query.notification_id, { status: 'read' });
        }

        // Fetch unread notifications
        const notifications = await Notification.find({ user: req.session.login });
        
        res.render('farmer/index.ejs', {
            site_title: SITE_TITLE,
            title: 'Home',
            session: req.session,
            categories,
            userLogin,
            groupedProducts,
            messages: req.flash(),
            currentUrl: req.originalUrl,
            notifications,
        });
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

        const { category, productType, name, minPrice, productInfo, auctionStart, auctionEnd } = req.body;

        if (!category || !productType || !name || !minPrice || !productInfo) {
            req.flash('error', 'All fields are required.');
            return res.redirect('/farmer/index');
        }

        try {
            const productImagePath = '/img/product/' + req.file.filename;

            // Ensure auction fields are stored only if they are provided
            const newProduct = new Product({
                category,
                productType,
                name,
                minPrice,
                productInfo,
                image: productImagePath,
                seller: req.session.login,
                auctionStart: productType === "wholesale" ? auctionStart || null : null,
                auctionEnd: productType === "wholesale" ? auctionEnd || null : null
            });

            await newProduct.save();

            console.log('New product saved:', newProduct);

            req.flash('success', 'Product added successfully!');
            res.redirect('/farmer/index');
        } catch (error) {
            console.error('Error saving product:', error);
            req.flash('error', 'Error saving product: ' + error.message);
            res.redirect('/farmer/index');
        }
    });
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
        res.redirect('/farmer/index');
    } catch (error) {
        console.error('Error updating notification status:', error);
        req.flash('error', 'Failed to update notification.');
        res.redirect('/farmer/index');
    }
};
