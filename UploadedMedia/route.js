const express = require("express");
const router = express.Router();

const Media = require("../model/Media");
const { adminAuth, userAuth } = require("../middleware/auth");

router.route("/upload").post(userAuth, async (res,req) => {
  
});
router.route("/get/:id").get(userAuth, async (res,req) => {
  
});

module.exports = router;
