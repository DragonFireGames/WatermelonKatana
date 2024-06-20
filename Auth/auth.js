const Users = require("../model/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function packUser(user) {
  const container = {};
  container.username = user.username;
  container.role = user.role;
  container.id = user._id;
  container.favorites = user.favorites;
  return container;
}

const jwtSecret = process.env["JWT_SECRET"];
exports.register = async (req, res, next) => {
  const { username, password } = req.body;
  if (password.length < 6) return res.status(400).json({ message: "Password less than 6 characters" });
  try {
    var hash = await bcrypt.hash(password, 10);
    const user = await Users.create({
      username,
      password: hash,
    })
    const maxAge = 3 * 60 * 60;
    const token = jwt.sign(
      { id: user._id, username, role: user.role },
      jwtSecret,
      {
        expiresIn: maxAge, // 3hrs
      }
    );
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    });
    res.status(201).json({
      message: "User successfully created",
      user: user._id,
      role: user.role,
    });
  } catch(error) {
    res.status(400).json({
      message: "User not successful created",
      error: error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  // Check if username and password is provided
  if (!username || !password) return res.status(400).json({
    message: "Username or Password not present",
  });
  try {
    const user = await Users.findOne({ username });
    if (!user) return res.status(404).json({
      message: "Login not successful",
      error: "User not found",
    });
    // comparing given password with hashed password
    var result = await bcrypt.compare(password, user.password);
    if (!result) return res.status(400).json({ message: "Login not succesful" });
    const maxAge = 3 * 60 * 60;
    const token = jwt.sign(
      { id: user._id, username, role: user.role },
      jwtSecret,
      {
        expiresIn: maxAge, // 3hrs in sec
      }
    );
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000, // 3hrs in ms
    });
    res.status(201).json({
      message: "User successfully Logged in",
      user: user._id,
      role: user.role,
    });
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.update = async (req, res, next) => {
  const { role, id } = req.body;
  // Verifying if role and id is presnt
  if (!role || !id) return res.status(400).json({ 
    message: "Role or Id not present" 
  });
  // Verifying if the value of role is admin
  if (role !== "Admin") return res.status(401).json({
    message: "Role is not admin",
  });
  try {
    // Finds the user with the id
    var user = await Users.findById(id);
    // Verifies the user is not an admin
    if (user.role !== "Admin") return res.status(400).json({
      message: "User is already an Admin"
    });
    user.role = role;
    await user.save();
    res.status(201).json({
      message: "Update successful",
      user 
    });
  } catch(error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message
    });
  };
};

exports.deleteUser = async (req, res, next) => {
  const { id } = req.body;
  try {
    var user = await Users.findById(id);
    user = await user.remove();
    // Remove score from every project the user has favorited
    res.status(201).json({ message: "User successfully deleted", user });
  } catch(error) {
    res.status(400).json({ message: "An error occurred", error: error.message })
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    var search = {};
    if (req.query.role) search.role = req.query.role;
    var users = await Users.find(search);
    const list = users.map(packUser);
    res.status(200).json({ user: list });
  } catch(err) {
    res.status(401).json({ message: "Not successful", error: err.message });
  }
};

exports.check = async (req, res, next) => {
  try {
    if (!res.locals.userToken) return res.status(200).json({auth:false});
    const uid = res.locals.userToken.id;
    var user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    user = packUser(user);
    res.status(200).json({auth:true,user});
  } catch(err) {
    res.status(401).json({ message: "Not successful", error: err.message });
    console.log(err.message);
  }
};

exports.userdata = async (req, res, next) => {
  try {
    const username = req.query.username;
    const uid = req.query.id;
    if ((uid && username) || (!uid && !username)) return res.status(404).json({
      message: "Fetch not successful",
      error: "Wrong query information",
    });
    if (username) var user = await Users.findOne({ username });
    if (uid) var user = await Users.findOne({ _id: uid });
    if (!user) return res.status(404).json({
      message: "Fetch not successful",
      error: "User not found",
    });
    user = packUser(user);
    res.status(200).json(user);
  } catch(err) {
    res.status(401).json({ message: "Not successful", error: err.message });
    console.log(err.message);
  }
};