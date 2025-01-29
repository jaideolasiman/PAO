const Category = require('../../models/category');
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
  

    const categories = await Category.find();
    res.render('admin/manageCategory', {
      site_title: SITE_TITLE,
      title: 'Manage Categories',
      session: req.session,
      categories,
      userLogin,
    });
  } catch (error) {
    console.error('Error displaying Manage Category:', error);
    res.status(500).render('500', {
      error: 'An error occurred while loading the Manage Category page.',
    });
  }
};

// Add a new category
module.exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const createdBy = req.session.login; // Assuming the logged-in user ID is stored in session
    const newCategory = new Category({ name, createdBy });
    await newCategory.save();
    res.status(201).json({ success: true, message: 'Category added successfully!' });
  } catch (err) {
    console.error('Error adding category:', err);
    res.status(500).json({ success: false, message: 'Failed to add category', error: err.message });
  }
};

// Delete a category
module.exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Category deleted successfully!' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ success: false, message: 'Failed to delete category', error: err.message });
  }
};

// Update a category
module.exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await Category.findByIdAndUpdate(id, { name });
    res.status(200).json({ success: true, message: 'Category updated successfully!' });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ success: false, message: 'Failed to update category', error: err.message });
  }
};