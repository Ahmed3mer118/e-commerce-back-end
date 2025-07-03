const express = require("express")
const router = express.Router()
const orderControllers = require("../controllers/orderControllers")
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { createOrder, getMyOrders, getMyOrderById ,cancelMyOrder } = orderControllers

//admin
router.get("/byAdmin", authenticate, authorize('admin'), orderControllers.getAllOrders);
router.get("/:id/byAdmin", authenticate, authorize('admin'), orderControllers.getOrderById);
router.post("/send/:id/byAdmin", authenticate, authorize('admin'), orderControllers.addOrderToShipping);
router.put("/status/:id/byAdmin", authenticate, authorize('admin'), orderControllers.updateStatusOrder);
// router.delete("/:id/byAdmin", authenticate, authorize('admin'), orderControllers.deleteOrder);

// user 
router.get("/",authenticate , getMyOrders);
router.get("/:id", authenticate, getMyOrderById);
router.post("/", authenticate, authorize('user'), createOrder);
router.put("/cancel/:id/status", authenticate, authorize('user'), cancelMyOrder);

module.exports = router