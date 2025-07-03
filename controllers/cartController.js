const Cart = require("../models/cart.model")
const Product = require("../models/product.model")
const mongoose = require("mongoose");


exports.addToCart = async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction();
    try {
        const { productId, quantity, sessionId } = req.body;
        if (!productId || !quantity) {
            return res.status(400).json({ message: "Product ID and quantity are required" });
        }
        const product = await Product.findById(productId).session(session);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (!productId) {
            return res.status(404).json({ message: "Product not found" });
        }

        const userId = req.user._id;
        const cartIdentifier = userId ?  userId : sessionId ;
        console.log(cartIdentifier)
        let cartItem = await Cart.findOne({
            cartIdentifier, // problem
            productId,
            isPurchased: false
        });
        if (cartItem) {
            const priceChanged = product.price !== cartItem.currentPrice
            cartItem = await Cart.findByIdAndUpdate(cartItem._id, {
                quantity: cartItem.quantity + quantity || quantity,
                currentPrice: product.price,
                priceChanged: priceChanged || cartItem.priceChanged,
                removedAt: null

            }, { new: true, session })
        }
        else {
            if (product.stock < quantity) {
                return res.status(400).json({
                    message: `Cannot purchase this quantity. Only ${product.stock} in stock.`
                });
            }

            cartItem = await Cart.create([{
                userId: req.user._id,
                sessionId: req.user ? null : req.body.sessionId,
                productId: productId,
                quantity: quantity,
                price: product.price,
                originalPrice: product.price,
                currentPrice: product.price,
            }], { session });
            await Product.findOneAndUpdate(
                { _id: productId, stock: { $gte: quantity } },
                { $inc: { stock: -quantity } },
                { new: true, session }
            );

        }

        await session.commitTransaction();
        session.endSession();
        let message = "Product added to cart successfully";
        if (cartItem.priceChanged) {
            message = "Product added to cart. Note: Price has changed since last time!";
        }

        return res.status(201).json({ message: message, data: cartItem, priceChanged: cartItem.priceChanged });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ error: "Server error while adding to cart." });
    }
};
exports.getUserProductInCart = async (req, res) => {
    try {
        const cart = await Cart.find({ userId: req.user._id });
        return res.status(200).json({ message: "Product in cart", data: cart });
    } catch (error) {
        res.status(500).json({
            error: "Server error while getting product in cart."
        });
    }
}
exports.getAllUserProductInCart = async (req, res) => {
    const cart = await Cart.find().populate('product user', "name email price ");
    res.status(200).json({ message: "list of user purchases", data: cart })
}

exports.getAbandonedProducts = async (req, res) => {
    const abandoned = await Cart.find({
        isPurchased: false,
        removedAt: { $exists: true }
    }).populate("productId userId");

    res.status(200).json({ message: "Abandoned products", data: abandoned });
};