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
const adminManageItemController = require('../controllers/admin/manageItemsController');


const farmerIndexController = require('../controllers/farmer/indexController');


const buyerIndexController = require('../controllers/buyer/indexController');
const orderController = require('../controllers/buyer/orderController');

const currentbidController = require('../controllers/buyer/currentbidController');

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
  app.post('/admin/manageItem/approve/:id', adminManageItemController.approveProduct);
  app.post('/admin/manageItem/reject/:id', adminManageItemController.rejectProduct);
  app.post('/admin/manageItem/delete/:id', adminManageItemController.deleteProduct);

  
  app.get('/farmer/index', farmerIndexController.index);  // Ensure this is correct
  app.post('/farmer/addProduct', farmerIndexController.addProduct);
  app.get('farmer/getBuyers', farmerIndexController.getBuyers);
  app.get('/farmer/notification', farmerIndexController.markNotificationAsRead);
  app.get('/farmer/getFarmerOrders', farmerIndexController.getFarmerOrders);
  app.post('/farmer/processOrder', farmerIndexController.processOrder);
  app.get('/farmer/deleteOrder/:id', farmerIndexController.deleteOrder);
  app.get('/farmer/showBuyer', farmerIndexController.showBuyer);
  app.get('/farmer/showParticipated', farmerIndexController.showParticipated);


  
  app.get('/buyer/markNotificationAsRead', buyerIndexController.markNotificationAsRead);
  app.get('/buyer/index', buyerIndexController.index);
  app.get('/buyer/getNotifications', buyerIndexController.getNotifications);
  app.post('/buyer/confirm-purchase', buyerIndexController.confirmPurchase);
  app.post('/buyer/getProducts', orderController.getProducts);
  app.post('/buyer/confirm-participation', buyerIndexController.confirmParticipation);
  app.get('/buyer/current-bids', buyerIndexController.getCurrentBids);


  app.get('/buyer/auction/room/:productId', currentbidController.index);
  app.post('/buyer/auction/room/:productId', currentbidController.doBid);
};