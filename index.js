require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('express-flash');
const dbConnect = require('./database/dbConnect');
const conn = dbConnect();
const User = require('./models/user');
const Product = require('./models/product');
const app = express();


app.use(session({
    secret: 'sessionsecret777',
    //cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 7 days
    resave: false,
    saveUninitialized: false, // Change to false for better security
    //store: store,
}));


app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
//Serve public assets
app.use('/public/admin', express.static(path.join(__dirname, 'public/admin')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Add this line to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Flash Messages
app.use(flash());

//Attach database instance to request object
app.use((req, res, next) => {
    req.db = conn; 
    next();
});

// Load web routes
require('./routes/web')(app);
// Get user from session
app.use((req, res, next) => {
    if (!req.session.login) {
        return res.redirect('/login');
    }
    next();
});

// Catch-all 404 route
app.use(async (req, res, next) => {
    const userLogin = await User.findById(req.session.login)
    return res.status(404).render('404', {
        login: req.session.login,
        userLogin: userLogin,
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
});

app.get('/farmer/notifications', async (req, res) => {
  if (!req.session.login) return res.json({ count: 0 });

  const count = await Notification.countDocuments({ user: req.session.login, status: 'unread' });
  res.json({ count });
});