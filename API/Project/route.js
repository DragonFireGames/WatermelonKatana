const express = require("express");
const router = express.Router();

const Projects = require(".../model/Projects");
const ProjectAPI = require("./project");
const poster = new ProjectAPI(Projects);
const { adminAuth, userAuth } = require(".../middleware/auth");

poster.route(router,userAuth,adminAuth);
router.route("/favorite/:id").get(userAuth, poster.favorite.bind(poster));
router.route("/unfavorite/:id").get(userAuth, poster.unfavorite.bind(poster));

module.exports = router;
