const express = require("express");
const router = express.Router();
const productControllers = require("../controllers/productControllers")
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const uploads = require('../middleware/uploads.middleware');

router.get("/", productControllers.getProducts);
router.get("/:id", productControllers.getProductsbyId);
router.post("/", authenticate, authorize('admin'), uploads.single('image'), productControllers.addProduct);
router.get("/send/stock", authenticate, authorize('admin'), productControllers.checkStock);
router.put("/:id", authenticate, authorize('admin'), uploads.single('image'), productControllers.updateProduct);
router.delete("/:id", authenticate, authorize('admin'), productControllers.deleteProduct);

module.exports = router;
