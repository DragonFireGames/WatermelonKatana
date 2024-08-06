const express = require("express");
const router = express.Router();

const Projects = require("../model/Projects")
const ProjectAPI = new (require("./project"))(Projects);
const { adminAuth, userAuth } = require("../middleware/auth");

ProjectAPI.route(router,adminAuth,userAuth);
router.route("/favorite/:id").get(userAuth, ProjectAPI.favorite.bind(ProjectAPI));
router.route("/unfavorite/:id").get(userAuth, ProjectAPI.unfavorite.bind(ProjectAPI));

module.exports = router;
