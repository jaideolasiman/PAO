const Order = require('../../models/order');
const Product = require('../../models/product');
const User = require('../../models/user');

module.exports.index = async (req, res) => {
  try {
    if (!req.session.login) {
      console.log("User not logged in, redirecting to login.");
      return res.redirect('/login');
    }

    const userLogin = await User.findById(req.session.login);
    console.log("Logged-in User:", userLogin); // Log user details

    if (userLogin.role.toLowerCase() !== 'admin') {
      console.warn(`Access Denied: User ${userLogin.email} is not an Admin.`);
      return res.status(403).send('Access Denied: Admins only');
    }

    let searchCategory = req.query.searchCategory || ''; // Get the search term from the query

    // Populate orders with product, seller, and buyer details, and apply search filter if provided
    let ordersQuery = Order.find()
      .populate('product', 'name image')
      .populate('seller', 'firstName lastName profilePicture')
      .populate('buyer', 'firstName lastName profilePicture');

    if (searchCategory) {
      // Apply search filter based on the category or product name
      ordersQuery = ordersQuery.where('product.name').regex(new RegExp(searchCategory, 'i'));
    }

    const orders = await ordersQuery;

    res.render('admin/manageAuctions', {
      orders,
      userLogin,
      searchCategory, // Pass the search term to the view
      site_title: 'PAO',
      title: 'Manage Orders',
      session: req.session,
    });
  } catch (error) {
    console.error('Error displaying Manage Orders:', error);
    res.status(500).render('500', {
      error: 'An error occurred while loading the Manage Orders page.',
    });
  }
};

module.exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.body.orderId;  // Get the order ID from the form submission

    // Find the order by ID and delete it
    const order = await Order.findByIdAndDelete(orderId);
    
    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Optionally delete the associated product if needed
    // const product = await Product.findByIdAndDelete(order.product);
    
    console.log(`Order with ID: ${orderId} has been deleted.`); // Log for debugging

    // Redirect back to the manage orders page after deletion
    res.redirect('/admin/manageAuction');  // Update with the correct route if needed
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).send('Internal Server Error');
  }
};