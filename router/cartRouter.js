const express = require('express');
const router = express.Router()
const cartController =  require("../controllers/cartController")
const {authenticate}  = require("../middleware/auth.middleware");
const {authorize}  = require("../middleware/role.middleware");

router.get("/",authenticate,authorize('user') , cartController.getUserProductInCart )
router.post("/",authenticate,authorize('user') , cartController.addToCart )

module.exports = router