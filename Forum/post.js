const Users = require("../model/Users");

function interpretBool(obj,name,str) {
  if (str == "0" || str == "false") obj[name] = false;
  if (str == "1" || str == "true") obj[name] = true;
}

module.exports = class {
  constructor(model,name) {
    this.model = model;
    this.name = name;
  }

route(router,userAuth,adminAuth) {
  router.route("/publish").post(userAuth, this.publish.bind(this));
  router.route("/list").get(this.list.bind(this));
  router.route("/data/:id").get(this.data.bind(this));
  router.route("/update/:id").put(userAuth, this.update.bind(this));
  router.route("/delete/:id").delete(userAuth, this.delete.bind(this));
  router.route("/delete/:id").get(userAuth, this.delete.bind(this));
  router.route("/feature/:id").get(adminAuth, this.feature.bind(this));
  router.route("/unfeature/:id").get(adminAuth, this.unfeature.bind(this));
  router.route("/comment/:id").post(userAuth, this.comment.bind(this));
  router.route("/comment/:id/edit").put(userAuth, this.editComment.bind(this));
  router.route("/comment/:id/delete").delete(userAuth, this.deleteComment.bind(this));
  router.route("/comment/:id/upvote").get(userAuth, this.upvoteComment.bind(this));
  router.route("/comment/:id/downvote").get(userAuth, this.downvoteComment.bind(this));
}
  
async publish(req, res, next) {
  var { name, content, tags, mature, hidden, privateRecipients } = req.body;
  console.log(name,content);
  try {
    const user = res.locals.userToken;
    const post = await this.model.create({
      name,
      content,
      tags,
      mature, 
      hidden, 
      privateRecipients,
      postedAt: Date.now(),
      activeAt: Date.now(),
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
  console.log(name,content);
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
    post.activeAt = Date.now();
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
    var search = { hidden: false };
    const { poster, platform, postedBefore, postedAfter, includeTags, excludeTags, featured, mature, recipient, customQuery } = req.query;
    if (poster) search.poster = poster;
    if (platform) search.platform = platform;
    interpretBool(search,"featured",featured);
    interpretBool(search,"mature",mature);
    // work out recipient search later
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
    var data = {};
    data[this.name] = list;
    res.status(200).json(data);
  } catch(err) {
    res.status(401).json({ message: "Not successful", error: err.message });
    console.log(err.message);
  }
};

async data(req, res, next) {
  try {
    const pid = req.params.id;
    if (pid === "undefined") return res.status(400).json({ message: "Missing Project ID" });
    var post = await this.model.findOne({ _id: pid });
    if (!post) return res.status(404).json({
      message: "Fetch not successful",
      error: "Post not found",
    });
    res.status(200).json(post.pack());
  } catch(err) {
    res.status(401).json({ message: "Not successful", error: err.message });
    console.log(err.message);
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
    post.activeAt = Date.now();
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
    var comment = post.comments[index];
    if (uid !== comment.posterId) return res.status(404).json({
      message: "Edit not successful",
      error: "User does not own comment",
    });
    post.activeAt = Date.now();
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

async upvoteComment(req, res, next) {
  var { index } = req.query;
  console.log("upvote",index);
  try {
    const pid = req.params.id;
    const post = await this.model.findOne({ _id: pid });
    if (!post) return res.status(404).json({
      message: "Fetch not successful",
      error: "Post not found",
    });
    const uid = res.locals.userToken.id;
    var comment = post.comments[index];
    if (comment.upvotes.includes(uid)) return res.status(404).json({
      message: "Upvote not successful",
      error: "Already upvoted",
    });
    comment.upvotes.push(uid);
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

async downvoteComment(req, res, next) {
  var { index } = req.query;
  console.log("downvote",index);
  try {
    const pid = req.params.id;
    const post = await this.model.findOne({ _id: pid });
    if (!post) return res.status(404).json({
      message: "Fetch not successful",
      error: "Post not found",
    });
    const uid = res.locals.userToken.id;
    var comment = post.comments[index];
    var voteindex = comment.upvotes.indexOf(uid);
    if (voteindex < 0) return res.status(404).json({
      message: "Downvote not successful",
      error: "Not upvoted",
    });
    comment.upvotes.splice(voteindex,1);
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


}
