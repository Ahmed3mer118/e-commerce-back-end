const Cart = require("../models/cart.model")
const Product = require("../models/product.model")
const mongoose = require("mongoose");


exports.addToCart = async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction();
    try {
        const { productId, quantity } = req.body;
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
        let cartItem = await Cart.findOne({
            userId,
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
        const cart = await Cart.find({ userId: req.user._id }).populate("productId", "product_title stock")
        return res.status(200).json({ message: "Product in cart", data: cart });
    } catch (error) {
        res.status(500).json({
            error: "Server error while getting product in cart."
        });
    }
}
exports.getAllUserProductInCart = async (req, res) => {
    const cart = await Cart.find().populate('product user', "name email price  ");
    res.status(200).json({ message: "list of user purchases", data: cart })
}

exports.getAbandonedProducts = async (req, res) => {
    const abandoned = await Cart.find({
        isPurchased: false,
        removedAt: { $exists: true }
    }).populate("productId userId");

    res.status(200).json({ message: "Abandoned products", data: abandoned });
};

exports.updateCart = async (req, res) => {
    try {
        const { id } = req.params
        const { quantity } = req.body;

        if (!id || !quantity || quantity < 1) {
            return res.status(400).json({ message: "Invalid cart item ID or quantity." });
        }

        const updatedCartItem = await Cart.findByIdAndUpdate(
            { _id: id },
            { quantity },
            { new: true }
        );
        if (!updatedCartItem) {
            return res.status(404).json({ message: "Cart item not found." });
        }

        return res.status(200).json({
            message: "Cart item updated successfully.",
            data: updatedCartItem
        });

    } catch (error) {
        return res.status(500).json({ message: "Server error while updating cart item." });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
      const { id } = req.body;
  
      const cartItem = await Cart.findById(id);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found." });
      }
  
      cartItem.quantity = 0;
      cartItem.removedAt = new Date();
      await cartItem.save();
  
      return res.status(200).json({ message: "Item removed from cart." });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error while removing from cart." });
    }
  };
  

exports.confirmPriceChange = async (req, res) => {
    try {
        const { id } = req.body;
        const cartItem = await Cart.findById(id);
        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found." });
        }
        cartItem.priceChanged = false;
        cartItem.originalPrice = cartItem.currentPrice;
        cartItem.removedAt = null;

        await cartItem.save();
        return res.status(200).json({ message: "Price confirmed", data: cartItem });

    } catch (error) {
        return res.status(500).json({ message: "Server error while confirming price change." });
    }
}