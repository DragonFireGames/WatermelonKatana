const connectDB = require("./db");
connectDB();

var Projects =  require("./model/Projects");
var Users =  require("./model/Users");

(async function(){try{

  /*var ulist = await Users.find({ });
  for (var u of ulist) {
    u.avatar = "https://fakeimg.pl/300x300";
    u.banner = "https://fakeimg.pl/720x360";
    u.biography = "This user has not added a biography yet.";
    await u.save();
  }*/
  
  //Projects.updateMany({ },{views:0,thumbnail:""}).then(console.log);

  // Run when converting to ref
  
  var list = await Projects.find({ });
  for (var p of list) {
    //var u = await Users.findById(p[i].posterId);
    //p[i].poster = u;
    //delete p[i].posterId;
    /*if (!p.iscdo) continue;
    const iscdo = p.link.match(/^https?:\/\/studio\.code\.org\/projects\/(applab|gamelab)\/([^/]+)/);
    p.thumbnail = `https://studio.code.org/v3/files/${iscdo[2]}/.metadata/thumbnail.png`;*/
    const iscdo = p.link.match(/^https?:\/\/studio\.code\.org\/projects\/(applab|gamelab)\/([^/]+)/);
    const isscratch = p.link.match(/^https?:\/\/scratch\.mit\.edu\/projects\/(\d+)/) || p.link.match(/^https?:\/\/turbowarp\.org\/(\d+)/);
    const iskhan = p.link.match(/^https?:\/\/www\.khanacademy\.org\/computer-programming\/([^/]+\/\d+)/);
    if (iscdo) {
      p.platform = "cdo";
    }
    if (isscratch) {
      p.platform = "scratch";
    }
    if (iskhan) {
      p.platform = "khan";
    }
    console.log(p);
    await p.save();
  }
  //*/
  
console.log("Done!")}catch(e){console.log(e);}})();

