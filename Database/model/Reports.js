
const Mongoose = require("mongoose");

const ReportSchema = new Mongoose.Schema({
  content: {
    type: String,
    default: "",
    maxlength: 500,
  },
  link: {
    type: String,
    maxlength: 100,
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
},{
  methods: {
    pack: function() {
      const container = {};
      container.content = this.content;
      container.link = this.link;
      container.postedAt = this.postedAt;
      container.activeAt = this.activeAt;
      container.id = this._id;
      container.posterId = this.posterId;
      container.poster = this.poster;
      return container;
    }
  }
});

const Reports = Mongoose.model("report", ReportSchema);

module.exports = Reports;