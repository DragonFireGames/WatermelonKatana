const Mongoose = require("mongoose");

const UserSchema = new Mongoose.Schema({
  username: {
    type: String,
    unique: true,
    collation: {
      locale: 'en',
      strength: 2
    },
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  avatar: {
    type: String,
    default: "https://fakeimg.pl/300x300",
  },
  banner: {
    type: String,
    default: "https://fakeimg.pl/720x360",
  },
  biography: {
    type: String,
    default: "This user has not added a biography yet.",
  },
  /*
  badges: [ number ],
  */
  role: {
    type: String,
    default: "Basic",
    required: true,
  },
  favorites: [ String ],
}, {
  methods: {
    pack: function() {
      const container = {};
      container.username = this.username;
      container.avatar = this.avatar;
      container.banner = this.banner;
      container.biography = this.biography;
      container.role = this.role;
      container.id = this._id;
      container.favorites = this.favorites;
      return container;
    }
  }
});

const Users = Mongoose.model("user", UserSchema);

module.exports = Users;
