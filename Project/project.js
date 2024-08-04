const Projects = require("../model/Projects");
const Users = require("../model/Users");

exports.publish = async (req, res, next) => {
  var { name, link, desc, tags, thumbnail } = req.body;
  console.log(name,link);
  try {
    const iscdo = link.match(/^https?:\/\/studio\.code\.org\/projects\/(applab|gamelab)\/([^/]+)/);
    const isscratch = link.match(/^https?:\/\/scratch\.mit\.edu\/projects\/(\d+)/) || link.match(/^https?:\/\/turbowarp\.org\/(\d+)/);
    const iskhan = link.match(/^https?:\/\/www\.khanacademy\.org\/computer-programming\/([^/]+\/\d+)/);
    if (!thumbnail && iscdo) thumbnail = `https://studio.code.org/v3/files/${iscdo[2]}/.metadata/thumbnail.png`;
    if (!thumbnail && isscratch) thumbnail = `https://uploads.scratch.mit.edu/get_image/project/${isscratch[1]}_432x288.png`;
    //if (!thumbnail && iskhan) thumbnail = `https://www.khanacademy.org/computer-programming/${iskhan[1]}/???.png`;
    var platform = "embed"
    if (iscdo) {
      link = iscdo[0];
      platform = "cdo";
    }
    if (isscratch) {
      link = isscratch[0];
      platform = "scratch";
    }
    if (iskhan) {
      link = iskhan[0];
      platform = "khan";
    }
    const user = res.locals.userToken;
    const project = await Projects.create({
      name,
      link,
      desc,
      tags,
      thumbnail,
      platform: platform,
      postedAt: Date.now(),
      posterId: user.id,
      poster: user.username, //convert to ref eventually
    });
    console.log(project);
    res.status(201).json({
      message: "Project successfully published",
      id: project._id,
      name: project.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Project not successfully published",
      error: error.message,
    });
    console.log(error.message);
  }
};

exports.update = async (req, res, next) => {
  var { name, link, desc, tags, thumbnail } = req.body;
  console.log(name,link);
  try {
    const pid = req.params.id;
    const project = await Projects.findOne({ _id: pid });
    if (!project) return res.status(404).json({
      message: "Fetch not successful",
      error: "Project not found",
    });
    const user = res.locals.userToken;
    if (project.posterId !== user.id && user.role !== "Admin") return res.status(403).json({
      message: "Not Authorized. You do not own this project",
    });
    const iscdo = link.match(/^https?:\/\/studio\.code\.org\/projects\/(applab|gamelab)\/([^/]+)/);
    const isscratch = link.match(/^https?:\/\/scratch\.mit\.edu\/projects\/(\d+)/) || link.match(/^https?:\/\/turbowarp\.org\/(\d+)/);
    const iskhan = link.match(/^https?:\/\/www\.khanacademy\.org\/computer-programming\/([^/]+\/\d+)/);
    if (!thumbnail && iscdo) thumbnail = `https://studio.code.org/v3/files/${iscdo[2]}/.metadata/thumbnail.png`;
    if (!thumbnail && isscratch) thumbnail = `https://uploads.scratch.mit.edu/get_image/project/${isscratch[1]}_432x288.png`;
    //if (!thumbnail && iskhan) thumbnail = `https://www.khanacademy.org/computer-programming/${iskhan[1]}/???.png`;
    var platform = "embed"
    if (iscdo) {
      link = iscdo[0];
      platform = "cdo";
    }
    if (isscratch) {
      link = isscratch[0];
      platform = "scratch";
    }
    if (iskhan) {
      link = iskhan[0];
      platform = "khan";
    }
    project.name = name;
    project.link = link;
    project.desc = desc;
    project.tags = tags;
    project.thumbnail = thumbnail;
    project.platform = platform;
    await project.save();
    res.status(201).json({
      message: "Project successfully updated",
      id: project._id,
      name: project.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Project not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const pid = req.params.id;
    const project = await Projects.findOne({ _id: pid });
    if (!project) return res.status(404).json({
      message: "Fetch not successful",
      error: "Project not found",
    });
    const user = res.locals.userToken;
    if (project.posterId !== user.id && user.role !== "Admin") return res.status(403).json({
      message: "Not Authorized. You do not own this project",
    });
    var users = await Users.find({ favorites: { $all: [ pid ] } });
    for (var i = 0; i < users.length; i++) {
      users[i].favorites.splice(users[i].favorites.indexOf(pid),1);
      await users[i].save();
    }
    await project.remove();
    console.log("deleted "+pid);
    res.status(201).json({
      message: "Project successfully deleted",
      id: project._id,
      name: project.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Project not successfully deleted",
      error: error.message,
    });
    console.log(error.message);
  }
};

exports.list = async (req, res, next) => {
  try {
    var search = {};
    const { poster, platform, postedBefore, postedAfter, includeTags, excludeTags, featured, customQuery } = req.query;
    if (poster) search.poster = poster;
    if (platform) search.platfrom = platfrom;
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
    var list = await Projects.find(search);
    list = list.map(e=>e.pack());
    res.status(200).json({ projects: list });
  } catch(err) {
    res.status(401).json({ message: "Not successful", error: err.message });
    console.log(err.message);
  }
};

exports.data = async (req, res, next) => {
  try {
    const pid = req.params.id;
    var project = await Projects.findOne({ _id: pid });
    if (!project) return res.status(404).json({
      message: "Fetch not successful",
      error: "Project not found",
    });
    project.views++;
    await project.save();
    res.status(200).json(project.pack());
  } catch(err) {
    res.status(401).json({ message: "Not successful", error: err.message });
    console.log(err.message);
  }
};

exports.favorite = async (req, res, next) => {
  try {
    const pid = req.params.id;
    const project = await Projects.findOne({ _id: pid });
    if (!project) return res.status(404).json({
      message: "Fetch not successful",
      error: "Project not found",
    });
    const uid = res.locals.userToken.id;
    const user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    if (user.favorites.includes(pid)) return res.status(400).json({
      message: "Invalid",
      error: "Already favorited project",
    });
    user.favorites.push(pid);
    project.score++;
    await user.save();
    await project.save();
    res.status(201).json({
      message: "Project successfully updated",
      id: project._id,
      name: project.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Project not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};
exports.unfavorite = async (req, res, next) => {
  try {
    const pid = req.params.id;
    const project = await Projects.findOne({ _id: pid });
    if (!project) return res.status(404).json({
      message: "Fetch not successful",
      error: "Project not found",
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
      error: "Haven't favorited project yet",
    });
    user.favorites.splice(index,1);
    project.score--;
    await user.save();
    await project.save();
    res.status(201).json({
      message: "Project successfully updated",
      id: project._id,
      name: project.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Project not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};

exports.feature = async (req, res, next) => {
  try {
    const pid = req.params.id;
    const project = await Projects.findOne({ _id: pid });
    if (!project) return res.status(404).json({
      message: "Fetch not successful",
      error: "Project not found",
    });
    project.featured = true;
    await project.save();
    res.status(201).json({
      message: "Project successfully updated",
      id: project._id,
      name: project.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Project not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};
exports.unfeature = async (req, res, next) => {
  try {
    const pid = req.params.id;
    const project = await Projects.findOne({ _id: pid });
    if (!project) return res.status(404).json({
      message: "Fetch not successful",
      error: "Project not found",
    });
    project.featured = false;
    await project.save();
    res.status(201).json({
      message: "Project successfully updated",
      id: project._id,
      name: project.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Project not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};

exports.comment = async (req, res, next) => {
  var { content, rating } = req.body;
  console.log(content,rating);
  try {
    const pid = req.params.id;
    const project = await Projects.findOne({ _id: pid });
    if (!project) return res.status(404).json({
      message: "Fetch not successful",
      error: "Project not found",
    });
    const user = res.locals.userToken;
    project.comments.push({
      content,
      rating,
      poster: user.username,
      posterId: user.id,
      postedAt: Date.now(),
    });
    await project.save();
    res.status(201).json({
      message: "Project successfully updated",
      id: project._id,
      name: project.name,
    });
    console.log("done!");
  } catch(error) {
    res.status(400).json({
      message: "Project not successfully updated",
      error: error.message,
    });
    console.log(error.message);
  }
};
