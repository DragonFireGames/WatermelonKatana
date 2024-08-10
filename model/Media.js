
const Mongoose = require("mongoose");

const MediaSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    default: "",
  },
  uploadedAt: {
    type: Number,
    required: true,
  },
  posterId: {
    type: String,
    required: true,
  },
},{
  methods: {
    pack: function() {
      const container = {};
      container.name = this.name;
      container.url = this.url;
      container.uploadedAt = this.uploadedAt;
      container.id = this._id;
      container.posterId = this.posterId;
      return container;
    }
  }
});

const Media = Mongoose.model("media", MediaSchema);

module.exports = Media;
