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
});

const Users = Mongoose.model("user", UserSchema);

module.exports = Users;
