const Mongoose = require("mongoose");

const CommentSchema = new Mongoose.Schema({
  content: {
    type: String,
    minlength: 1,
    required: true,
  },
  upvotes: [ String ],
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

module.exports = CommentSchema;
