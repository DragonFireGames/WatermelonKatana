
const Mongoose = require("mongoose");

const CommentSchema = require("./Comments");

const PostSchema = new Mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    required: true,
    maxlength: 100,
  },
  content: {
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
  views: {
    type: Number,
    default: 0,
  },
  viewers: [ String ],
  upvotes: [ String ],
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
      container.content = this.content;
      container.featured = this.featured;
      container.tags = this.tags || [];
      container.mature = this.mature;
      container.hidden = this.hidden;
      container.privateRecipients = this.privateRecipients;
      container.views = this.views;
      container.viewers = this.viewers;
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

PostSchema.index({
  name: "text", 
  content: "text",
  poster: "text",
  tags: "text",
},{
  weights: {
    name: 2, 
    content: 1,
    poster: 0.75,
    tags: 1.5,
  },
  name: "searchIndex"
});

const Posts = Mongoose.model("post", PostSchema);

module.exports = Posts;
