const multer = require('multer');
const User = require('../../models/user');

// Configure Multer for File Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Save in uploads folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage: storage });

module.exports.uploadProfilePicture = [
    // Middleware for handling file upload
    upload.single('profilePicture'),
  
    async (req, res) => {
      try {
        const user = await User.findById(req.session.login);
        if (!user) {
          req.flash('error', 'User not found.');
          return res.redirect('/login');
        }
  
        // **Insertion Point:**
  
        if (req.file) { // Check if a profile picture was uploaded
          user.profilePicture = `/uploads/${req.file.filename}`;
          await user.save();
        }
  
        // Rest of your existing code:
        req.flash('success', 'Profile picture updated successfully!');
        res.redirect('/profile');
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/profile');
      }
    },
  ];

// Render Profile Page with User Data
module.exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.login);
        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/login');
        }

        res.render('profile', { user });
    } catch (error) {
        console.error('Error retrieving profile:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/login');
    }
};
