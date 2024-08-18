const Mongoose = require("mongoose");

const CommentSchema = require("./Comments");

const ProjectSchema = new Mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    required: true,
    maxlength: 100,
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
    maxlength: 15000,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  tags: [ String ],
  mature: {
    type: Boolean,
    default: false,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  privateRecipients: [ String ],
  score: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  upvotes: [ String ],
  platform: {
    type: String,
    default: "embed",
  },
  postedAt: {
    type: Number,
    required: true,
  },
  activeAt: {
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
      container.featured = this.featured;
      container.thumbnail = this.thumbnail;
      container.tags = this.tags || [];
      container.mature = this.mature;
      container.hidden = this.hidden;
      container.privateRecipients = this.privateRecipients;
      container.score = this.score;
      container.views = this.views;
      container.upvotes = this.upvotes;
      container.comments = this.comments;
      container.platform = this.platform;
      container.postedAt = this.postedAt;
      container.activeAt = this.activeAt;
      container.id = this._id;
      container.posterId = this.posterId;
      container.poster = this.poster;
      return container;
    }
  }
});

const Projects = Mongoose.model("project", ProjectSchema);

module.exports = Projects;
