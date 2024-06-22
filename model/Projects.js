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
  thumbnail: {
    type: String,
    default: "",
  },
  desc: {
    type: String,
    default: "",
  },
  score: {
    type: Number,
    default: 0,
  },
  views: {
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
  /*poster: {
    type: Mongoose.ObjectId,
    ref: "user",
  },*/
  comments: [ CommentSchema ]
},{
  methods: {
    pack: function() {
      const container = {};
      container.name = this.name;
      container.link = this.link;
      container.desc = this.desc;
      container.thumbnail = this.thumbnail;
      container.score = this.score;
      container.views = this.views;
      container.iscdo = this.iscdo;
      container.postedAt = this.postedAt;
      container.id = this._id;
      container.posterId = this.posterId;
      container.poster = this.poster;
      return container;
    }
  }
});

const Projects = Mongoose.model("project", ProjectSchema);

module.exports = Projects;
