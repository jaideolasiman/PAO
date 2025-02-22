const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    phoneNumber: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'complete', 'failed'], default: 'pending' },  // ✅ Updated status value      
    completedAt: { type: Date, default: null }, // ✅ Store completion timestamp
    failedAt: { type: Date, default: null }, // ✅ Store failure timestamp
}, { timestamps: true }); 

// ✅ Auto-update `updatedAt` field whenever an order is modified
orderSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Order', orderSchema);
