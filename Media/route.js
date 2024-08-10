const express = require("express");
const router = express.Router();
const fetch = require("cross-fetch");

const Media = require("../model/Media");
const { adminAuth, userAuth } = require("../middleware/auth");

router.route("/upload").post(userAuth, express.urlencoded({ limit: "32mb" }), async (req,res) => {
  try {
    console.log(req.body);
    var params = new URLSearchParams();
    params.set("key",process.env.IMGBB_API_KEY);
    params.set("name",req.body.name);
    params.set("image",req.body.image);
    console.log(params);
    var data = await fetch("https://api.imgbb.com/1/upload",{
      method: "POST",
      body: params
    });
    console.log(data);
    data = await data.json();
    console.log(data);
    if (data.error) throw data.error;
    const image = data.data;
    const user = res.locals.userToken;
    const media = Media.create({
      name: image.title,
      url: image.url,
      delete_url: image.delete_url,
      width: image.width,
      height: image.height,
      size: image.size,
      type: image.image.extension,
      uploadedAt: image.time,
      poster: user.username,
      posterId: user.id,
    });
    console.log(media);
    res.status(200).json({
      message: "Media successfully uploaded",
      id: media._id,
      name: media.name,
    });
  } catch(error) {
    res.status(400).json({
      message: "Media not successfully uploaded",
      error: error.message,
    });
    console.log(error.message);
  }
});
router.route("/get/:id").get(async (req,res) => {
  try {
    var mid = req.params.id;
    var media = await Media.findOne({ _id: mid });
    var request = await fetch(media.url);
    if (request.status >= 206) throw { message: "Could not fetch; Error Code: "+request.status };
    var blob = await request.blob();
    var buffer = await blob.arrayBuffer();
    buffer = Buffer.from(buffer);
    res.set("Content-Type", blob.type);
    res.send(buffer);
  } catch(error) {
    res.status(400).json({
      message: "Media not successfully fetched",
      error: error.message,
    });
    console.log(error.message);
  }
});

module.exports = router;
