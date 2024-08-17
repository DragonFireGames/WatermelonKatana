
const Mongoose = require("mongoose");

const ReportSchema = new Mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    required: true,
    maxlength: 100,
  },
  content: {
    type: String,
    default: "",
    maxlength: 5000,
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
      container.name = this.name;
      container.content = this.content;
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
