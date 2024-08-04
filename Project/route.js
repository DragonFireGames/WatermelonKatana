const express = require("express");
const router = express.Router();

const { publish, list, data, update, deleteProject, favorite, unfavorite, feature, unfeature, comment } = require("./project");
const { adminAuth, userAuth } = require("../middleware/auth");

router.route("/publish").post(userAuth, publish);
router.route("/list").get(list);
router.route("/data/:id").get(data);
router.route("/update/:id").post(userAuth, update);
router.route("/delete/:id").delete(userAuth, deleteProject);
router.route("/delete/:id").get(userAuth, deleteProject);
router.route("/favorite/:id").get(userAuth, favorite);
router.route("/unfavorite/:id").get(userAuth, unfavorite);
router.route("/feature/:id").get(adminAuth, feature);
router.route("/unfeature/:id").get(adminAuth, unfeature);
router.route("/comment/:id").post(comment);

module.exports = router;
