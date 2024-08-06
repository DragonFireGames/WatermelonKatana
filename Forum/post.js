const Posts = require("../model/Posts");
const Users = require("../model/Users");

exports.publish = async (req, res, next) => {
  var { name, content, tags } = req.body;
  console.log(name,link);
  try {
    const user = res.locals.userToken;
    const post = await Posts.create({
      name,
      content,
      tags,
      postedAt: Date.now(),
      posterId: user.id,
      poster: user.username, //convert to ref eventually
    });
    console.log(post);
    res.status(201).json({
      message: "Post successfully published",
      id: post._id,
      name: post.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Post not successfully published",
      error: error.message,
    });
    console.log(error.message);
  }
};

exports.update = async (req, res, next) => {
  var { name, content, tags } = req.body;
  console.log(name,link);
  try {
    const pid = req.params.id;
    const post = await Posts.findOne({ _id: pid });
    if (!post) return res.status(404).json({
      message: "Fetch not successful",
      error: "Post not found",
    });
    const user = res.locals.userToken;
    if (post.posterId !== user.id && user.role !== "Admin") return res.status(403).json({
      message: "Not Authorized. You do not own this post",
    });
    post.name = name;
    post.content = content;
    post.tags = tags;
    await post.save();
    res.status(201).json({
      message: "Post successfully updated",
      id: post._id,
      name: post.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Post not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const pid = req.params.id;
    const post = await Posts.findOne({ _id: pid });
    if (!post) return res.status(404).json({
      message: "Fetch not successful",
      error: "Post not found",
    });
    const user = res.locals.userToken;
    if (post.posterId !== user.id && user.role !== "Admin") return res.status(403).json({
      message: "Not Authorized. You do not own this post",
    });
    var users = await Users.find({ following: { $all: [ pid ] } });
    for (var i = 0; i < users.length; i++) {
      users[i].following.splice(users[i].following.indexOf(pid),1);
      await users[i].save();
    }
    await post.remove();
    console.log("deleted "+pid);
    res.status(201).json({
      message: "Post successfully deleted",
      id: post._id,
      name: post.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Post not successfully deleted",
      error: error.message,
    });
    console.log(error.message);
  }
};

exports.list = async (req, res, next) => {
  try {
    var search = {};
    const { poster, platform, postedBefore, postedAfter, includeTags, excludeTags, pinned, customQuery } = req.query;
    if (poster) search.poster = poster;
    if (platform) search.platform = platform;
    if (pinned == "0" || pinned == "false") search.pinned = false;
    else if (pinned == "1" || pinned == "true") search.pinned = true;
    if (postedBefore || postedAfter) {
      search.postedAt = {};
      if (postedBefore) search.postedAt.$lte = postedBefore;
      if (postedAfter) search.postedAt.$gte = postedAfter;
    }
    if (includeTags) {
      search.tags = { $all: includeTags.split("+") };
    }
    if (excludeTags) {
      excludeTags = excludeTags.split("+");
      search.$nor = [];
      for (var i = 0; i < excludeTags.length; i++) {
        search.$nor.push({ tags: excludeTags[i] });
      }
    }
    if (customQuery) search = JSON.parse(customQuery);
    var list = await Posts.find(search);
    list = list.map(e=>e.pack());
    res.status(200).json({ posts: list });
  } catch(err) {
    res.status(401).json({ message: "Not successful", error: err.message });
    console.log(err.message);
  }
};

exports.data = async (req, res, next) => {
  try {
    const pid = req.params.id;
    var post = await Posts.findOne({ _id: pid });
    if (!post) return res.status(404).json({
      message: "Fetch not successful",
      error: "Post not found",
    });
    post.views++;
    await post.save();
    res.status(200).json(post.pack());
  } catch(err) {
    res.status(401).json({ message: "Not successful", error: err.message });
    console.log(err.message);
  }
};


exports.follow = async (req, res, next) => {
  try {
    const pid = req.params.id;
    const post = await Posts.findOne({ _id: pid });
    if (!post) return res.status(404).json({
      message: "Fetch not successful",
      error: "Post not found",
    });
    const uid = res.locals.userToken.id;
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    if (user.following.includes(pid)) return res.status(400).json({
      message: "Invalid",
      error: "Already followed post",
    });
    user.following.push(pid);
    post.followers++;
    await user.save();
    await post.save();
    res.status(201).json({
      message: "Post successfully updated",
      id: post._id,
      name: post.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Post not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};
exports.unfollow = async (req, res, next) => {
  try {
    const pid = req.params.id;
    const post = await Posts.findOne({ _id: pid });
    if (!post) return res.status(404).json({
      message: "Fetch not successful",
      error: "Post not found",
    });
    const uid = res.locals.userToken.id;
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    const index = user.following.indexOf(pid);
    if (index === -1) return res.status(400).json({
      message: "Invalid",
      error: "Haven't followd post yet",
    });
    user.following.splice(index,1);
    post.followers--;
    await user.save();
    await post.save();
    res.status(201).json({
      message: "Post successfully updated",
      id: post._id,
      name: post.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Post not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};

exports.pin = async (req, res, next) => {
  try {
    const pid = req.params.id;
    const post = await Posts.findOne({ _id: pid });
    if (!post) return res.status(404).json({
      message: "Fetch not successful",
      error: "Post not found",
    });
    post.pinned = true;
    await post.save();
    res.status(201).json({
      message: "Post successfully updated",
      id: post._id,
      name: post.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Post not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};
exports.unpin = async (req, res, next) => {
  try {
    const pid = req.params.id;
    const post = await Posts.findOne({ _id: pid });
    if (!post) return res.status(404).json({
      message: "Fetch not successful",
      error: "Post not found",
    });
    post.pinned = false;
    await post.save();
    res.status(201).json({
      message: "Post successfully updated",
      id: post._id,
      name: post.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Post not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};

exports.comment = async (req, res, next) => {
  var { content } = req.body;
  console.log(content);
  try {
    const pid = req.params.id;
    const post = await Posts.findOne({ _id: pid });
    if (!post) return res.status(404).json({
      message: "Fetch not successful",
      error: "Post not found",
    });
    const uid = res.locals.userToken.id;
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    post.comments.push({
      content,
      rating: 0,
      poster: user.username,
      posterId: user.id,
      postedAt: Date.now(),
    });
    await post.save();
    res.status(201).json({
      message: "Post successfully updated",
      id: post._id,
      name: post.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Post not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};

exports.deleteComment = async (req, res, next) => {
  var { index } = req.body;
  console.log(index);
  try {
    const pid = req.params.id;
    const post = await Posts.findOne({ _id: pid });
    if (!post) return res.status(404).json({
      message: "Fetch not successful",
      error: "Post not found",
    });
    const uid = res.locals.userToken.id;
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    var comment = post.comments[index];
    if (user.id !== comment.posterId && user.role !== "Admin") return res.status(404).json({
      message: "Delete not successful",
      error: "User does not own comment",
    });
    post.comments.splice(index,1);
    await post.save();
    res.status(201).json({
      message: "Post successfully updated",
      id: post._id,
      name: post.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Post not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};

exports.editComment = async (req, res, next) => {
  var { content, index } = req.body;
  console.log(content,index);
  try {
    const pid = req.params.id;
    const post = await Posts.findOne({ _id: pid });
    if (!post) return res.status(404).json({
      message: "Fetch not successful",
      error: "Post not found",
    });
    const uid = res.locals.userToken.id;
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    var comment = post.comments[index];
    if (user.id !== comment.posterId) return res.status(404).json({
      message: "Delete not successful",
      error: "User does not own comment",
    });
    comment.content = content;
    await post.save();
    res.status(201).json({
      message: "Post successfully updated",
      id: post._id,
      name: post.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Post not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};


