const express = require("express");
const router = express.Router();

const Posts = require("../model/Posts")
const PostAPI = new (require("./post"))(Posts,"posts");
const { adminAuth, userAuth } = require("../middleware/auth");

PostAPI.route(router,adminAuth,userAuth);

module.exports = router;
