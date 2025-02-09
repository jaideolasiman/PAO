const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Store seller ID
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
