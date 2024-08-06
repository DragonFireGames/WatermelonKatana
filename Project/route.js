const express = require("express");
const router = express.Router();

const ProjectAPI = new (require("./project"))();
const { adminAuth, userAuth } = require("../middleware/auth");

ProjectAPI.route(router,adminAuth,userAuth);
router.route("/favorite/:id").get(userAuth, ProjectAPI.favorite);
router.route("/unfavorite/:id").get(userAuth, ProjectAPI.unfavorite);

module.exports = router;
