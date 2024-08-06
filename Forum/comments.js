const Users = require("../model/Users");

exports = function(obj,ParentModel) {

obj.comment = async (req, res, next) => {
  var { content } = req.body;
  console.log(content);
  try {
    const pid = req.params.id;
    const parent = await ParentModel.findOne({ _id: pid });
    if (!parent) return res.status(404).json({
      message: "Fetch not successful",
      error: "Parent not found",
    });
    const uid = res.locals.userToken.id;
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    parent.comments.push({
      content,
      rating: 0,
      poster: user.username,
      posterId: user.id,
      postedAt: Date.now(),
    });
    await parent.save();
    res.status(201).json({
      message: "Parent successfully updated",
      id: parent._id,
      name: parent.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Parent not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};

obj.deleteComment = async (req, res, next) => {
  var { index } = req.body;
  console.log(index);
  try {
    const pid = req.params.id;
    const parent = await ParentModel.findOne({ _id: pid });
    if (!parent) return res.status(404).json({
      message: "Fetch not successful",
      error: "Parent not found",
    });
    const uid = res.locals.userToken.id;
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    var comment = parent.comments[index];
    if (user.id !== comment.posterId && user.role !== "Admin") return res.status(404).json({
      message: "Delete not successful",
      error: "User does not own comment",
    });
    parent.comments.splice(index,1);
    await parent.save();
    res.status(201).json({
      message: "Parent successfully updated",
      id: parent._id,
      name: parent.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Parent not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};

obj.editComment = async (req, res, next) => {
  var { content, index } = req.body;
  console.log(content,index);
  try {
    const pid = req.params.id;
    const parent = await ParentModel.findOne({ _id: pid });
    if (!parent) return res.status(404).json({
      message: "Fetch not successful",
      error: "Parent not found",
    });
    const uid = res.locals.userToken.id;
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    var comment = parent.comments[index];
    if (user.id !== comment.posterId) return res.status(404).json({
      message: "Delete not successful",
      error: "User does not own comment",
    });
    comment.content = content;
    await parent.save();
    res.status(201).json({
      message: "Parent successfully updated",
      id: parent._id,
      name: parent.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Parent not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};

}
