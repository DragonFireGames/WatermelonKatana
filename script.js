const connectDB = require("./db");
connectDB();

var Projects =  require("./model/Projects");
var Users =  require("./model/Users");

(async function(){try{
  
  //Projects.updateMany({ },{views:0,thumbnail:""}).then(console.log);

  /*// Run when converting to ref
  
  var p = await Projects.find({ });
  for (var i = 0; i < p.length; i++) {
    var u = await Users.findById(p[0].posterId);
    p[0].poster = u;
    delete p[0].posterId;
  }
  //*/
  
}catch(e){console.log(e);})();

