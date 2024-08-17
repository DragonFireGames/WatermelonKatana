
const Mongoose = require("mongoose");

const MediaSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 500
  },
  url: {
    type: String,
    required: true,
  },
  delete_url: {
    type: String,
    required: true,
  },
  width: Number,
  height: Number,
  size: Number,
  type: String,
  uploadedAt: {
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
},{
  methods: {
    pack: function() {
      const container = {};
      container.name = this.name;
      container.imgbb_url = this.url;
      container.url = '/api/media/get/'+this._id+'/'+this.name+"."+this.type;
      container.width = this.width;
      container.height = this.height;
      container.size = this.size;
      container.type = this.type;
      container.uploadedAt = this.uploadedAt;
      container.id = this._id;
      container.posterId = this.posterId;
      container.poster = this.poster;
      return container;
    }
  }
});

const Media = Mongoose.model("media", MediaSchema);

module.exports = Media;
