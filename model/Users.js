const Mongoose = require("mongoose");

const UserSchema = new Mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  /*avatar: {
    type: String,
    default: "https://fakeimg.pl/300x300",
    required: true,
  },*/
  role: {
    type: String,
    default: "Basic",
    required: true,
  },
  favorites: [ String ],
  //badges: [ Number ],
}, {
  methods: {
    pack: function() {
      const container = {};
      container.username = this.username;
      container.role = this.role;
      container.id = this._id;
      container.favorites = this.favorites;
      return container;
    }
  }
});

const Users = Mongoose.model("user", UserSchema);

module.exports = Users;
