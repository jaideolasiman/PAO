const Product = require('../../models/product'); // Adjust path as necessary
const multer = require('multer');
const fileUpload = require('../../middlewares/product-upload-middleware.js'); // Import your file upload middleware

// Controller function to add a product
module.exports.addProduct = async (req, res) => {
  try {
    // Configure multer with your middleware
    const upload = multer({
      storage: fileUpload.files.storage(),
      fileFilter: fileUpload.files.allowedFile,
    }).single('productImage');

    // Use multer to handle file uploads
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(400).json({ success: false, message: 'Multer error: ' + err.message });
      } else if (err) {
        console.error('File upload error:', err);
        return res.status(400).json({ success: false, message: 'File upload error: ' + err.message });
      }

      console.log('File uploaded successfully:', req.file);

      // Set the image URL if a file was uploaded
      const imageUrl = req.file ? `/public/img/product/${req.file.filename}` : '';

      // Extract product data from the request body
      const { category, productName, minPrice, productInfo, productType, auctionStart, auctionEnd } = req.body;

      // Validate required fields
      if (!category || !productName || !minPrice || !productInfo || !productType) {
        return res.status(400).json({ success: false, message: 'All required fields must be filled out.' });
      }

      // If the product type is "auction", validate auction-specific fields
      if (productType === 'auction' && (!auctionStart || !auctionEnd)) {
        return res.status(400).json({ success: false, message: 'Auction start and end times are required for auction products.' });
      }

      // Create a new product object
      const newProduct = new Product({
        category,
        name: productName,
        minPrice,
        description: productInfo,
        type: productType,
        imageUrl, // Save the uploaded image path
        farmer: req.session.login, // Assuming the logged-in farmer's ID is stored in the session
        auctionDetails: productType === 'auction' ? { start: auctionStart, end: auctionEnd } : null,
      });

      // Save the product to the database
      await newProduct.save();

      // Respond with success
      res.status(201).json({
        success: true,
        message: 'Product added successfully.',
        product: newProduct,
      });
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: 'Server error. Could not add product.' });
  }
};
