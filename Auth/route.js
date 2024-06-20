const express = require("express");
const router = express.Router();

const { register, login, update, deleteUser, getUsers, userdata, check } = require("./auth");
const { adminAuth, userAuth, checkAuth } = require("../middleware/auth");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/update").put(adminAuth, update);
router.route("/deleteUser").delete(adminAuth, deleteUser);
router.route("/getUsers").get(getUsers);
router.route("/check").get(checkAuth, check);
router.route("/userdata").get(userdata);

module.exports = router;
