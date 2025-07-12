const express = require("express");
const router = express.Router();
const brandControllers  = require("../controllers/brandControllers")
router.get("/", brandControllers.getBrand);
router.get("/:id", brandControllers.getBrandById);
router.post("/",brandControllers.addBrand);
router.put("/:id", brandControllers.updateBrand);
router.delete("/:id", brandControllers.deleteBrand );

module.exports = router;
