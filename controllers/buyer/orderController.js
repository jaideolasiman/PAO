// controllers/buyer/orderController.js
const Order = require('../../models/order');
const Product = require('../../models/product');
const User = require('../../models/user'); 

module.exports.placeOrder = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const buyerId = req.session.login;
        //const products = await Product.find()
            //.populate('category', 'name')
            //.populate('seller');
        
        if (!buyerId) {
            return res.status(401).json({ success: false, message: 'Please log in first.' });
        }

        const product = await Product.findById(productId).populate('seller');
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const totalPrice = product.minPrice * quantity;
        const newOrder = new Order({
            buyer: buyerId,
            phoneNumber: buyerId.phoneNumber,
            seller: product.seller,
            product: productId,
            quantity,
            totalPrice,
            session: req.session,
            status: 'Pending'
        });

        await newOrder.save();
        res.status(200).json({ success: true, message: 'Order placed successfully!' });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};

module.exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category', 'name')
            .populate('seller');

        // Verify if products have seller populated
        console.log(products);  // Log products to check if the seller is being populated correctly

        res.render('buyer/products', { products }); // Pass products to the view
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Server Error');
    }
};
