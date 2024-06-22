const connectDB = require("./db");
connectDB();

var Projects =  require("./model/Projects");
var Users =  require("./model/Users");

(async function(){try{
  
  //Projects.updateMany({ },{views:0,thumbnail:""}).then(console.log);

  //* Run when converting to ref
  
  var list = await Projects.find({ });
  for (var p of list) {
    //var u = await Users.findById(p[i].posterId);
    //p[i].poster = u;
    //delete p[i].posterId;
    if (!p.iscdo) continue;
    const iscdo = p.link.match(/^https?:\/\/studio\.code\.org\/projects\/(applab|gamelab)\/([^/]+)/);
    p.thumbnail = `https://studio.code.org/v3/files/${iscdo[2]}/.metadata/thumbnail.png`;
    await p.save();
  }
  //*/
  
console.log("Done!")}catch(e){console.log(e);}})();

