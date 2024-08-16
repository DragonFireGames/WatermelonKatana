const express = require("express");
const router = express.Router();
const fetch = require("cross-fetch");
const bcrypt = require("bcryptjs");

const Users = require("../model/Users");
const Projects = require("../model/Projects");
const Posts = require("../model/Posts");
const { adminAuth } = require("../middleware/auth");

router.route("/transfer").get(adminAuth, async (req,res) => {
  const { uid, project, post } = req.query;
  try {
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Transfer not successful",
      error: "User not found",
    });
    var p = false;
    if (project && !post) p = await Projects.find({ _id: project });
    if (post && !project) p = await Posts.find({ _id: post });
    if (!p) return res.status(404).json({
      message: "Transfer not successful",
      error: "Post/Project not found",
    });
    p.poster = user.username;
    p.posterId = uid;
    p.save();
    res.status(200).json({
      message: "Transfer successful",
    });
  } catch(error) {
    res.status(400).json({
      message: "Transfer not successful",
      error: error.message,
    });
    console.log(error.message);
  }
});
router.route("resetpassword").get(adminAuth, async (req,res)=>{
  const { uid, password } = req.query;
  try {
    var hash = await bcrypt.hash(password||"password", 10);
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Transfer not successful",
      error: "User not found",
    });
    user.password = hash;
    await user.save();
    res.status(201).json({
      message: "Password successfully reset",
      user: user._id,
      role: user.role,
    });
  } catch(error) {
    res.status(400).json({
      message: "Password not successfully reset",
      error: error.message,
    });
  }
});

module.exports = router;
