
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
// admin
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("userId products.productId", "name email product_title price")

        return res.status(200).json({ message: "Orders fetched successfully", orders });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate("userId", "name email").populate("products.productId", "product_title product_image price");
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        return res.status(200).json({ message: "Order fetched successfully", order });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
exports.addOrderToShipping = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        const order = await Order.findById(orderId);
        if (!order || !status) {
            return res.status(400).json({ error: "Order ID and status are required" });
        }
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        if (status === "shipped") {
            return res.status(400).json({ error: "Order is already shipped" })
        }

        await Order.findByIdAndUpdate(orderId, {
            status: "shipped"
        }, { new: true });

        return res.status(200).json({ message: "Order marked as shipped", order });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}
exports.updateStatusOrder = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const updateStatusOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        return res.status(200).json({ message: `Order status updated to ${status}`, updateStatusOrder });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// exports.deleteOrder = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const order = await Order.findByIdAndDelete(id);
//         if (!order) {
//             return res.status(404).json({ error: "Order not found or already deleted" });
//         }

//         return res.status(200).json({ message: "Order deleted successfully", order });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error: error.message });
//     }
// };



// Users

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const cartItems = await Cart.find({ userId, isPurchased: false }).populate("productId");

        if (cartItems.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        const previousOrderCount = await Order.countDocuments({ userId });
        const products = cartItems.map((item) => ({
            productId: item.productId._id,
            product_title: item.productId.product_title,
            product_image: item.productId.product_image,
            quantity: item.quantity || 1,
            price: item.productId.price,
        }));

        const newOrder = await Order.create({
            userId,
            products,
            orderNumber: previousOrderCount + 1,
            status: "pending",
            shippingData: req.body.shippingData,
            paymentMethod: req.body.paymentMethod || "Cash",
        });

        //   await Cart.updateMany(
        //     { userId, isPurchased: false },
        //     { $set: { isPurchased: true, purchasedAt: new Date() } }
        //   );

        await Cart.deleteMany({ userId });

        return res.status(201).json({ message: "Order created", order: newOrder });

    } catch (error) {
        console.error("Create Order Error:", error);
        return res.status(500).json({ error: "Server error while creating order" });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        const orders = await Order.find({ userId }).populate("products.productId").sort({ createdAt: -1 })
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found for this user" });
        }

        res.status(200).json({ message: "Orders fetched", orders });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getMyOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        console.log(orderId)
        const order = await Order.findById(orderId).populate("products.productId", "product_title product_image qauntity");
        console.log(order)
        return res.status(200).json({ order })
    }
    catch (error) {
        res.status(500).json({ error: "Server error while fetching order by id" })
    }
}
exports.cancelMyOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.status !== "pending") {
            return res.status(400).json({ message: "Only pending orders can be cancelled" });
        }

        const updateStatusOrder = await Order.findByIdAndUpdate(
            id,
            { status: "cancelled" },
            { new: true }
        );
        return res.status(200).json({ message: "Order cancelled", updateStatusOrder });

    }
    catch (error) {
        res.status(500).json({ error: "Server error while cancelling order" });

    }
}