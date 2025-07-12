const express = require('express');
const router = express.Router()
const cartController =  require("../controllers/cartController")
const {authenticate}  = require("../middleware/auth.middleware");
const {authorize}  = require("../middleware/role.middleware");

router.post("/",authenticate, cartController.addToCart )
router.put("/remove",authenticate, cartController.removeFromCart )
router.put('/confirm-price', authenticate, cartController.confirmPriceChange);
router.put("/:id",authenticate, cartController.updateCart )
router.get("/",authenticate,authorize('user') , cartController.getUserProductInCart )


module.exports = router