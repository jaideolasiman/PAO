
const authLoginController = require('../controllers/auth/loginController');
const authRegisterController = require('../controllers/auth/registerController');
const authVerifyController = require('../controllers/auth/verifyController');
const authVerifyEdiController = require('../controllers/auth/verifyEditController');
const authLogoutController = require('../controllers/auth/logoutController');
const authTermsController = require('../controllers/auth/termsController');
const profileController = require('../controllers/auth/profileController');

const adminIndexController = require('../controllers/admin/indexController');
const manageCategoryController = require('../controllers/admin/manageCategoryController');


const farmerIndexController = require('../controllers/farmer/indexController');
const productController = require('../controllers/farmer/productController');


const buyerIndexController = require('../controllers/buyer/indexController');


module.exports = function(app){
    app.get('/login', authLoginController.login);
    app.post('/doLogin', authLoginController.doLogin);
    app.post('/logout', authLogoutController.logout);
    app.get('/register', authRegisterController.register);
    app.post('/doRegister', authRegisterController.doRegister);
    app.get('/verify', authVerifyController.verify);
    app.post('/doVerify', authVerifyController.doVerify);
    app.get('/verifyEdit', authVerifyEdiController.verify);
    app.post('/verifyDoEdit', authVerifyEdiController.doVerify);
    app.get('/terms', authTermsController.index);
    app.post('/upload-profile', profileController.uploadProfilePicture);
    app.get('/profile', profileController.getProfile);


    app.get('/admin/index', adminIndexController.index);
    app.get('/admin/manageCategory', manageCategoryController.manageCategory);
   

    app.get('/farmer/index', farmerIndexController.index); 
    app.post('/addProduct', productController.addProduct);


    app.get('/buyer/index', buyerIndexController.index);

}