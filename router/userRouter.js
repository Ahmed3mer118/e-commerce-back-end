const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers")
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
router.get("/byAdmin",authenticate, authorize('admin') ,  userControllers.getUsers )
router.get("/", authenticate, authorize('user'), userControllers.getUsersById);

module.exports = router;
