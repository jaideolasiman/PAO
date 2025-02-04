const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    productType: { type: String, required: true },
    name: { type: String, required: true },
    minPrice: { type: Number, required: true },
    productInfo: { type: String, required: true },
    image: { type: String, required: true }, // Storing the relative image path
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Add this field
    auctionStart: { type: Date, default: null }, // New field for auction start time
    auctionEnd: { type: Date, default: null } // New field for auction end time
    
});

const Product = mongoose.model('product', productSchema);

module.exports = Product;
