const Mongoose = require("mongoose");

const NotificationSchema = new Mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Number,
    required: true,
  },
});

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
  email: String,
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
  badges: [ Number ],
  role: {
    type: String,
    default: "Basic",
    required: true,
  },
  favorites: [ String ],
  following: [ String ],
  followers: [ String ],
  joinedAt: {
    type: Number,
    required: true,
  },
  mature: {
    type: Boolean,
    default: false,
  },
  notifications: [ NotificationSchema ],
}, {
  methods: {
    pack: function() {
      const container = {};
      container.username = this.username;
      container.avatar = this.avatar;
      container.banner = this.banner;
      container.biography = this.biography;
      container.badges = this.badges;
      container.role = this.role;
      container.favorites = this.favorites;
      container.following = this.following;
      container.followers = this.followers;
      container.joinedAt = this.joinedAt;
      container.notifications = this.notifications;
      container.id = this._id;
      return container;
    },
    notify: function(title,content) {
      this.notifications.push({ 
        title,
        content,
        createdAt: Date.now()
      });
    }
  }
});

const Users = Mongoose.model("user", UserSchema);

module.exports = Users;
