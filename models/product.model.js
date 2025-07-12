const mongoose = require('mongoose');
const Cart = require("./cart.model")

const productSchema = new mongoose.Schema({
    product_title: {
        type: String,
        required: true,
    },
    product_image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    product_description: {
        type: String,
        required: true,
    },
    category_name: {
        type: String,
        enum: ['men', 'women'],
        default: 'men'
    },
    stock: {
        type: Number,
        default: 1,
        required: true
    },
    minStock: {
        type: Number,
        default: 5,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    routeProduct: {
        type: String,
        unique: true
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        // required: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
    }

}, {
    timeseries: true
});
productSchema.post('findOneAndUpdate', async (doc) => {
    if (!doc) return
    try {
        const productId = doc._id
        const newPrice = doc.price
        const cartItems = await Cart.find({
            productId, isPurchased: false
        })
        for (const item of cartItems) {
            if (item.currentPrice !== newPrice) {
                item.currentPrice = newPrice;
                item.priceChanged = true;
                await item.save();
            }
        }
    } catch (error) {
        res.send(500).json({ error: error })
    }
})

module.exports = mongoose.model('Product', productSchema);
