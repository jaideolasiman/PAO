const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false, // Optional, only if an image URL is provided
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to Category model
    required: true,
  },
  productType: {
    type: String,
    enum: ['retail', 'wholesale'], // Only 'retail' or 'wholesale'
    required: true,
  },
  auctionDate: {
    type: Date,
    required: false, // Only required for wholesale products
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
