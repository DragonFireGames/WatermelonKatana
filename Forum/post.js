const Users = require("../model/Users");

module.exports = class {
constructor(model) {
  this.model = model;
}
async publish(req, res, next) {
  var { name, content, tags } = req.body;
  console.log(name,link);
  try {
    const user = res.locals.userToken;
    const post = await this.model.create({
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
}
  
async update(req, res, next) {
  var { name, content, tags } = req.body;
  console.log(name,link);
  try {
    const pid = req.params.id;
    const post = await this.model.findOne({ _id: pid });
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

async delete(req, res, next) {
  try {
    const pid = req.params.id;
    const post = await this.model.findOne({ _id: pid });
    if (!post) return res.status(404).json({
      message: "Fetch not successful",
      error: "Post not found",
    });
    const user = res.locals.userToken;
    if (post.posterId !== user.id && user.role !== "Admin") return res.status(403).json({
      message: "Not Authorized. You do not own this post",
    });
    var users = await Users.find({ favorites: { $all: [ pid ] } });
    for (var i = 0; i < users.length; i++) {
      users[i].favorites.splice(users[i].favorites.indexOf(pid),1);
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

async list(req, res, next) {
  try {
    var search = {};
    const { poster, platform, postedBefore, postedAfter, includeTags, excludeTags, featured, customQuery } = req.query;
    if (poster) search.poster = poster;
    if (platform) search.platform = platform;
    if (featured == "0" || featured == "false") search.featured = false;
    else if (featured == "1" || featured == "true") search.featured = true;
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
    var list = await this.model.find(search);
    list = list.map(e=>e.pack());
    res.status(200).json({ this.model: list });
  } catch(err) {
    res.status(401).json({ message: "Not successful", error: err.message });
    console.log(err.message);
  }
};

async data(req, res, next) {
  try {
    const pid = req.params.id;
    var post = await this.model.findOne({ _id: pid });
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


async favorite(req, res, next) {
  try {
    const pid = req.params.id;
    const post = await this.model.findOne({ _id: pid });
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
    if (user.favorites.includes(pid)) return res.status(400).json({
      message: "Invalid",
      error: "Already favorited post",
    });
    user.favorites.push(pid);
    post.score++;
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
async unfavorite(req, res, next) {
  try {
    const pid = req.params.id;
    const post = await this.model.findOne({ _id: pid });
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
    const index = user.favorites.indexOf(pid);
    if (index === -1) return res.status(400).json({
      message: "Invalid",
      error: "Haven't favorited post yet",
    });
    user.favorites.splice(index,1);
    post.score--;
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

async feature(req, res, next) {
  try {
    const pid = req.params.id;
    const post = await this.model.findOne({ _id: pid });
    if (!post) return res.status(404).json({
      message: "Fetch not successful",
      error: "Post not found",
    });
    post.featured = true;
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
async unfeature(req, res, next) {
  try {
    const pid = req.params.id;
    const post = await this.model.findOne({ _id: pid });
    if (!post) return res.status(404).json({
      message: "Fetch not successful",
      error: "Post not found",
    });
    post.featured = false;
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

async comment(req, res, next) {
  var { content } = req.body;
  console.log(content);
  try {
    const pid = req.params.id;
    const post = await this.model.findOne({ _id: pid });
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

async deleteComment(req, res, next) {
  var { index } = req.body;
  console.log(index);
  try {
    const pid = req.params.id;
    const post = await this.model.findOne({ _id: pid });
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

async editComment(req, res, next) {
  var { content, index } = req.body;
  console.log(content,index);
  try {
    const pid = req.params.id;
    const post = await this.model.findOne({ _id: pid });
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


