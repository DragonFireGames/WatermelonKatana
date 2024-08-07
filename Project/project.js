const Users = require("../model/Users");
var PostAPI = require("../Forum/post.js");
module.exports = class extends PostAPI {
  constructor(model) {
    super(model,"projects")
  }

processLink(link,thumbnail) {
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
  return { link, platform, thumbnail }
}
  
async publish(req, res, next) {
  var { name, link, desc, tags, thumbnail, platform } = req.body;
  console.log(name,link);
  try {
    var e = this.processLink(link,thumbnail);
    const user = res.locals.userToken;
    const project = await this.model.create({
      name,
      link: e.link,
      desc,
      tags,
      thumbnail: e.thumbnail,
      platform: e.platform,
      postedAt: Date.now(),
      activeAt: Date.now(),
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

async update(req, res, next) {
  var { name, link, desc, tags, thumbnail, platform } = req.body;
  console.log(name,link);
  try {
    const pid = req.params.id;
    const project = await this.model.findOne({ _id: pid });
    if (!project) return res.status(404).json({
      message: "Fetch not successful",
      error: "Project not found",
    });
    const user = res.locals.userToken;
    if (project.posterId !== user.id && user.role !== "Admin") return res.status(403).json({
      message: "Not Authorized. You do not own this project",
    });
    var e = this.processLink(link,thumbnail);
    project.name = name;
    project.link = e.link;
    project.desc = desc;
    project.tags = tags;
    project.thumbnail = e.thumbnail;
    project.platform = e.platform;
    project.activeAt = Date.now();
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

async delete(req, res, next) {
  try {
    const pid = req.params.id;
    const project = await this.model.findOne({ _id: pid });
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

async favorite(req, res, next) {
  try {
    const pid = req.params.id;
    const project = await this.model.findOne({ _id: pid });
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
async unfavorite(req, res, next) {
  try {
    const pid = req.params.id;
    const project = await this.model.findOne({ _id: pid });
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

};
