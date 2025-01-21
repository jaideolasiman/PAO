const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['fruits', 'vegetables', 'grains'], // Ensure valid categories
    },
    productName: {
        type: String,
        required: true,
        trim: true,
    },
    minPrice: {
        type: Number,
        required: true,
    },
    productInfo: {
        type: String,
        required: true,
        trim: true,
    },
    productType: {
        type: String,
        required: true,
        enum: ['auction', 'retail'], // Ensure it's either 'auction' or 'retail'
    },
    auctionStart: {
        type: Date,
        required: function () {
            return this.productType === 'auction'; // Required only for auction products
        },
    },
    auctionEnd: {
        type: Date,
        required: function () {
            return this.productType === 'auction'; // Required only for auction products
        },
    },
    imageUrl: {
        type: String,
        required: true,
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model for farmers
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Product', productSchema);
