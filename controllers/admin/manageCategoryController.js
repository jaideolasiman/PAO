const Category = require('../../models/category'); // Assuming a Category model exists

// Render the Manage Category page
module.exports.manageCategory = async (req, res) => {
  try {
    // Fetch all categories from the database to display in the view
    const categories = await Category.find();

    // Render the manageCategory.ejs and pass the fetched categories
    res.render('admin/manageCategory', {
      session: req.session,
      categories, // Pass the list of categories to the view
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).render('500', { error: 'Server error while loading categories.' });
  }
};
