const User = require('../../models/user');
const SITE_TITLE = 'PAO';

module.exports.index = async (req, res) => {
    try {
        // Log session for debugging
        console.log('Session Data:', req.session);

        // Check if user is logged in
        const userLogin = await User.findById(req.session.login);
        
        if (userLogin) {
            res.render('admin/index.ejs', {
                site_title: SITE_TITLE,
                title: 'Home',
                req: req,
                messages: req.flash(),
                userLogin: userLogin,
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