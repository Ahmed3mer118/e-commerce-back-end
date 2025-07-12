const mongoose = require("mongoose")

const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () {
            return !this.sessionId;
        }
    },
    sessionId: {
        type: String,
        required: function () {
            return !this.userId;
        }
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    originalPrice: {
        type: Number,
        required: true
    },
    currentPrice: {
        type: Number
    },
    priceChanged: {
        type: Boolean,
        default: false
    },
    quantity: {
        type: Number,
        default: 1,
    },
    isPurchased: {
        type: Boolean,
        default: false
    },
    removedAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
})

module.exports = mongoose.model("Cart", cartSchema)