const User = require('../../models/user'); // Adjust path if needed
const SITE_TITLE = 'PAO';

// Display Manage Category Page
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
  const users = await User.find();
    res.render('admin/manageUsers', {
      site_title: SITE_TITLE,
      title: 'Manage Categories',
      session: req.session,
      users,
      userLogin,
    });
  } catch (error) {
    console.error('Error displaying Manage Category:', error);
    res.status(500).render('500', {
      error: 'An error occurred while loading the Manage Category page.',
    });
  }
};

exports.renderManageUser = async (req, res) => {
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
  
      // Fetch all users with their details
      const users = await User.find({});
      
      // Pass the userLogin and users to the view
      res.render("admin/manageUsers", {
        users,
        userLogin, // Make sure userLogin is available in the view
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  };
  
  
  exports.approveUser = async (req, res) => {
    try {
      const userId = req.params.id;
      // Find user and set isVerified to true
      await User.findByIdAndUpdate(userId, { isVerified: true });
      res.redirect("/admin/manageUsers");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  };
  
  exports.deactivateUser = async (req, res) => {
    try {
      const userId = req.params.id;
  
      // Set the user's status to "deactivated"
      await User.findByIdAndUpdate(userId, { status: 'deactivated' });
  
      res.redirect("/admin/manageUsers");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  };