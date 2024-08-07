const express = require("express");
const router = express.Router();

const Posts = require("../model/Posts")
const PostAPI = require("./post");
const poster = new PostAPI(Posts,"posts");
const { adminAuth, userAuth } = require("../middleware/auth");

poster.route(router,userAuth,adminAuth);

module.exports = router;
