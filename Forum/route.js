const express = require("express");
const router = express.Router();

const { publish, list, data, update, deletePost, follow, unfollow, pin, unpin, comment, editComment, deleteComment } = require("./project");
const { adminAuth, userAuth } = require("../middleware/auth");

router.route("/publish").post(userAuth, publish);
router.route("/list").get(list);
router.route("/data/:id").get(data);
router.route("/update/:id").post(userAuth, update);
router.route("/delete/:id").delete(userAuth, deletePost);
router.route("/delete/:id").get(userAuth, deletePost);
router.route("/follow/:id").get(userAuth, follow);
router.route("/unfollow/:id").get(userAuth, unfollow);
router.route("/pin/:id").get(adminAuth, pin);
router.route("/unpin/:id").get(adminAuth, unpin);
router.route("/comment/:id").post(userAuth, comment);
router.route("/comment/:id/edit").post(userAuth, editComment);
router.route("/comment/:id/delete").delete(userAuth, deleteComment);

module.exports = router;
