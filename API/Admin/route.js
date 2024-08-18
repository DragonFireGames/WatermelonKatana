const express = require("express");
const router = express.Router();

const { transferProject, resetPassword, createReport, listReports } = require("./admin");
const { adminAuth, userAuth, checkAuth } = require("../../middleware/auth");

router.route("/transfer").get(adminAuth, transferProject);
router.route("/resetpassword").get(adminAuth, resetPassword);
router.route("/reports/create").post(userAuth, createReport);
router.route("/reports/list").get(adminAuth, listReports);

module.exports = router;
