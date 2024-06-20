const Projects = require("../model/Projects");
const Users = require("../model/Users");

function packProject(project) {
  const container = {};
  container.name = project.name;
  container.link = project.link;
  container.desc = project.desc;
  container.score = project.score;
  container.iscdo = project.iscdo;
  container.postedAt = project.postedAt;
  container.id = project._id;
  container.posterId = project.posterId;
  container.poster = project.poster;
  return container;
}

exports.publish = async (req, res, next) => {
  var { name, link, desc } = req.body;
  console.log(name,link);
  try {
    const iscdo = link.match(/^https?:\/\/studio\.code\.org\/projects\/(applab|gamelab)\/([^/]+)/);
    if (iscdo) link = iscdo[0];
    const user = res.locals.userToken;
    const project = await Projects.create({
      name,
      link,
      desc,
      iscdo: !!iscdo,
      postedAt: Date.now(),
      posterId: user.id,
      poster: user.username,
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
  var { name, link, desc } = req.body;
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
    if (iscdo) link = iscdo[0];
    project.name = name;
    project.link = link;
    project.desc = desc;
    project.iscdo = !!iscdo;
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
    const {poster, iscdo, before, after} = req.query;
    if (poster) search.poster = poster;
    if (iscdo == "0" || iscdo == "false") search.iscdo = false;
    else if (iscdo == "1" || iscdo == "true") search.iscdo = true;
    if (before || after) {
      search.postedAt = {};
      if (before) search.postedAt.$lte = before;
      if (after) search.postedAt.$gte = after;
    }
    var list = await Projects.find(search);
    list = list.map(packProject);
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
    project = packProject(project);
    res.status(200).json(project);
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