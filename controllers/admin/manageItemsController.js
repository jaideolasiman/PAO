// controllers/admin/manageItemsController.js
const Product = require('../../models/product');
const User = require('../../models/user');
const Notification = require('../../models/notification'); // Import Notification model

module.exports.index = async (req, res) => {
  try {
    const userLogin = await User.findById(req.session.login);
    if (!userLogin || userLogin.role.toLowerCase() !== 'admin') {
      return res.status(403).send('Access Denied: Admins only');
    }

    const products = await Product.find()
      .populate('category', 'name')
      .populate('seller');

    res.render('admin/manageItems', {
      site_title: 'PAO',
      title: 'Manage Items',
      session: req.session,
      products,
      userLogin,
    });
  } catch (error) {
    console.error('Error displaying Manage Item:', error);
    res.status(500).render('500', { error: 'An error occurred while loading the Manage Item page.' });
  }
};

// Approve product
// Approve product
module.exports.approveProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(productId, { status: 'approved' }, { new: true });

    if (product) {
      const seller = await User.findById(product.seller);
      if (seller) {
        await Notification.create({
          user: seller._id,
          message: `Your product "${product.name}" has been approved.`,
        });
      }
    }
    res.redirect('/admin/manageItem');
  } catch (error) {
    console.error('Error approving product:', error);
    res.redirect('/admin/manageItem');
  }
};

// Reject product and delete it from the database
// Reject Product
module.exports.rejectProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(productId, { status: 'rejected' }, { new: true });

    if (product) {
      const seller = await User.findById(product.seller);
      if (seller) {
        // Save notification for the farmer
        await Notification.create({
          user: seller._id,
          message: `Your product "${product.name}" has been rejected. Please check your product and upload it again.`,
        });
      }
    }
    res.redirect('/admin/manageItem');
  } catch (error) {
    console.error('Error rejecting product:', error);
    res.redirect('/admin/manageItem');
  }
};

// Delete Product (This will delete the product from the database entirely)
module.exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Find and remove the product by its ID
    const product = await Product.findByIdAndDelete(productId);

    if (product) {
      // Notify the seller (farmer) that the product has been deleted
      const seller = await User.findById(product.seller);
      if (seller) {
        await Notification.create({
          user: seller._id,
          message: `Your product "${product.name}" has been deleted permanently.`,
        });
      }
    }

    // Redirect back to the admin page after deletion
    res.redirect('/admin/manageItem');
  } catch (error) {
    console.error('Error deleting product:', error);
    res.redirect('/admin/manageItem');
  }
};