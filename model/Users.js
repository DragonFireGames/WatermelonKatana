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
  badges: [ Number ],
  */
  role: {
    type: String,
    default: "Basic",
    required: true,
  },
  favorites: [ String ],
  joinedAt: {
    type: Number,
    default: Date.now()
  },
}, {
  methods: {
    pack: function() {
      const container = {};
      container.username = this.username;
      container.avatar = this.avatar;
      container.banner = this.banner;
      container.biography = this.biography;
      container.role = this.role;
      container.favorites = this.favorites;
      container.joinedAt = this.joinedAt;
      container.id = this._id;
      return container;
    }
  }
});

const Users = Mongoose.model("user", UserSchema);

module.exports = Users;
