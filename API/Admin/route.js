const express = require("express");
const router = express.Router();

const { transferProject, resetPassword } = require("./admin");
const { adminAuth, userAuth, checkAuth } = require("../../middleware/auth");

router.route("/transfer").get(adminAuth, transferProject);
router.route("/resetpassword").get(adminAuth, resetPassword);

module.exports = router;
