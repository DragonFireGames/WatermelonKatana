const connectDB = require("./db");
connectDB();

var Projects =  require("./model/Projects");
var Users =  require("./model/Users");

(async function(){try{

  var ulist = await Users.find({ });
  for (var u of ulist) {
    //u.avatar = "https://fakeimg.pl/300x300";
    //u.banner = "https://fakeimg.pl/720x360";
    //u.biography = "This user has not added a biography yet.";
    //u.joinedAt = Date.now();
    u.badges = [];
    u.followers = [];
    u.following = [];
    u.notifications = [];
    await u.save();
  }
  
  //Projects.updateMany({ },{views:0,thumbnail:""}).then(console.log);

  //* Run when converting to ref
  
  var list = await Projects.find({ });
  for (var p of list) {
    //var u = await Users.findById(p[i].posterId);
    //p[i].poster = u;
    //delete p[i].posterId;
    delete p.iscdo;
    delete p.iskhan;
    delete p.isscratch;
    if (!p.activeAt) p.activeAt = p.postedAt;
    await p.save();
  }
  //*/
  
console.log("Done!")}catch(e){console.log(e);}})();

