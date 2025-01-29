const authLoginController = require('../controllers/auth/loginController');
const authRegisterController = require('../controllers/auth/registerController');
const authVerifyController = require('../controllers/auth/verifyController');
const authVerifyEdiController = require('../controllers/auth/verifyEditController');
const authLogoutController = require('../controllers/auth/logoutController');
const authTermsController = require('../controllers/auth/termsController');
const profileController = require('../controllers/auth/profileController');

const adminIndexController = require('../controllers/admin/indexController');
const adminManageCategoryController = require('../controllers/admin/manageCategoryController');
const adminManageUserController = require('../controllers/admin/manageUsersController');
const adminManageAuctionController = require('../controllers/admin/manageAuctionController');
const adminManageItemController = require('../controllers/admin/manageItemController');

const upload = require('../middlewares/product-upload-middleware');
const farmerIndexController = require('../controllers/farmer/indexController');


const buyerIndexController = require('../controllers/buyer/indexController');

module.exports = function (app) {
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
  app.get('/admin/manageCategory', adminManageCategoryController.index);
  app.post('/admin/manageCategory/add', adminManageCategoryController.addCategory);
  app.delete('/admin/manageCategory/delete/:id', adminManageCategoryController.deleteCategory);
  app.put('/admin/manageCategory/update/:id', adminManageCategoryController.updateCategory);
  app.get('/admin/manageUsers', adminManageUserController.renderManageUser); // Added
  app.post('/admin/manageUsers/approve/:id', adminManageUserController.approveUser); // Added
  app.post('/admin/manageUsers/deactivate/:id', adminManageUserController.deactivateUser); // Added
  app.get('/admin/manageAuction', adminManageAuctionController.index);
  app.get('/admin/manageItem', adminManageItemController.index);

  app.get('/farmer/index', farmerIndexController.index);
  app.post('/farmer/addProduct', upload.single('productImage'), farmerIndexController.addProduct);

  app.get('/buyer/index', buyerIndexController.index);

  
};