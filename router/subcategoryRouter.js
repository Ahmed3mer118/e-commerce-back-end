const express = require("express");
const router = express.Router();
const subcategory = require("../controllers/subcategoryControllers")

router.get("/",subcategory.getSubcategory );
router.post("/",subcategory.addSubcategory);
router.put("/:id",subcategory.updateSubcategory);
router.delete("/:id",subcategory.deleteSubcategory);

module.exports = router;
