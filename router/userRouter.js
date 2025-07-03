const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers")

router.get("/", userControllers.getUsers )
router.get("/:id", userControllers.getUsersById);

module.exports = router;
