
module.exports.logout = (req, res) => {
    const login = req.session.login;
    req.session.destroy((err) => {
        if (err) {
            console.error('error destroying session', err);
        } else {
            console.log('user logout', login)
            return res.redirect('/login');
        }
    })
}