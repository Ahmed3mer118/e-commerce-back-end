const mongoose = require("mongoose")

const OrderSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            },
            price: {
                type: Number,
                required: true
            }

        }
    ],
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', "returned"],
        default: "pending"
    },
    shippingData: {
        address: [String],
        phone: String
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'CreditCard', 'Instapay'],
        default: 'Cash'
    },
    orderNumber:{
        type:Number
    }
}, {
    timestamps: true
})


module.exports = mongoose.model("Order", OrderSchema);