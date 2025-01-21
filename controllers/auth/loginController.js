const User = require('../../models/user')
const SITE_TITLE = 'PAO';

module.exports.login = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (req.session.login) {
            return res.redirect('login');
        } else {
            res.render('login', {
                site_title: SITE_TITLE,
                title: 'Login',
                session: req.session,
                messages: req.flash(),
                currentUrl: req.originalUrl,
                userLogin: userLogin,
                req: req,
            });
        }
    } catch (error) {
        console.log('error:', error)
        return res.status(500).render('500');
    }
}
module.exports.doLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            req.flash('error', 'Invalid email.');
            return res.redirect('/login');
        }

        // Handle Buyer Role
        if (user.role === 'buyer') {
            if (!user.isVerified) {
                req.flash('error', 'User email is not verified.');
                return res.redirect('/login');
            }
        }

        // Compare Password
        user.comparePassword(password, (err, valid) => {
            if (err) {
                req.flash('error', 'Error validating password.');
                return res.redirect('/login');
            }
            if (!valid) {
                req.flash('error', 'Invalid password.');
                return res.redirect('/login');
            }

            // Assign session and redirect based on role
            req.session.login = user.id;
            return res.redirect(`/${user.role}/index`);
        });
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An unexpected error occurred.');
        return res.status(500).redirect('/login');
    }
};


