const User = require('../../models/user');
const SITE_TITLE = 'PAO';

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
    res.render('admin/manageAuctions', {
      site_title: SITE_TITLE,
      title: 'Manage Auction',
      session: req.session,
      users,
      userLogin,
    });
  } catch (error) {
    console.error('Error displaying Manage Auction:', error);
    res.status(500).render('500', {
      error: 'An error occurred while loading the Manage Auction page.',
    });
  }
}; 