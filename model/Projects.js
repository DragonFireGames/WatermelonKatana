const Mongoose = require("mongoose");

const CommentSchema = new Mongoose.Schema({
  content: {
    type: String,
    minlength: 1,
    required: true,
  },
  postedAt: {
    type: Number,
    required: true,
  },
  posterId: {
    type: String,
    required: true,
  },
  poster: {
    type: String,
    required: true,
  }
});

const ProjectSchema = new Mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    required: true,
  },
  link: {
    type: String,
    minlength: 6,
    required: true,
  },
  desc: {
    type: String,
    default: "",
  },
  score: {
    type: Number,
    default: 0,
  },
  iscdo: {
    type: Boolean,
    default: false,
  },
  postedAt: {
    type: Number,
    required: true,
  },
  posterId: {
    type: String,
    required: true,
  },
  poster: {
    type: String,
    required: true,
  },
  comments: [ CommentSchema ]
});

const Projects = Mongoose.model("project", ProjectSchema);

module.exports = Projects;
