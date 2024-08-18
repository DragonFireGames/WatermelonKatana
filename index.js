/**
 * Import necessary modules and dependencies
 */
const express = require("express");
const connectDB = require("./Database/connect");
const app = express();
const cookieParser = require("cookie-parser");
const { adminAuth, userAuth, checkAuth } = require("./middleware/auth");
const { Turbo } = require("./client/Turbo/index");
const PORT = process.env.PORT || 3000;
const sendFileReplace = require("./middleware/replace");

/**
 * Connect to the database
 */
connectDB();

/**
 * Middleware setup
 */
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies attached to the client request

/**
 * Serve static files from the client directory
 */
app.use(express.static(__dirname + "/client"));

/**
 * Initialize TurboWarp with static dependencies
 */
const turbo = new Turbo(app, express.static("./client/Turbo/dependencies"));

/**
 * Define API routes
 */
app.use("/api/auth", require("./API/Auth/route")); // Authentication routes
app.use("/api/project", require("./API/Project/route")); // Project routes
app.use("/api/forum", require("./API/Forum/route")); // Project routes
app.use("/api/media", require("./API/Media/route")); // Media routes
app.use("/api/admin", require("./API/Admin/route")); // Admin command routes

/**
 * Client directory path
 */
const cldir = __dirname + "/client";

/**
 * Define route handlers for serving HTML files
 */
app.get("/", (req, res) => res.sendFile(cldir + "/home.html")); // Home page
app.get("/register", (req, res) => res.sendFile(cldir + "/register.html")); // Registration page
app.get("/login", (req, res) => res.sendFile(cldir + "/login.html")); // Login page
app.get("/ui-tester", (req, res) => res.sendFile(cldir + "/ui-tester.html")); // UI Testing page

// Logout route: clear the JWT cookie and redirect to home
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
});

// Chat page, users only
app.get("/chat", userAuth, (req, res) => res.sendFile(cldir + "/chat.html"));
app.get("/verify", userAuth, (req, res) => res.sendFile(cldir + "/verification.html"))


// Admin page, admins only
app.get("/admin", adminAuth, (req, res) => res.sendFile(cldir + "/admin.html"));
// Basic user page, users only
app.get("/userlist", userAuth, (req, res) => res.sendFile(cldir + "/userlist.html"));

// Media list
app.get("/uploadedmedia", (req, res) => res.sendFile(cldir + "/media.html"));

function makeLiteralChars(string) {
  string = string.replace(/\&/g,"&amp;");
  string = string.replace(/</g,"&lt;");
  string = string.replace(/>/g,"&gt;");
  string = string.replace(/"/g,"&quot;");
  string = string.replace(/'/g,"&apos;");
  //string = string.replace(/ /g,"&nbsp;");
  return string;
}

const Users = require("./Database/model/Users"); // Users

// Projects
app.get("/search", (req, res) => res.sendFile(cldir + "/search.html")); // Search page
app.get("/publish", userAuth, (req, res) =>
  res.sendFile(cldir + "/publish.html"),
); // Publish page, users only
const Projects = require("./Database/model/Projects");
app.get("/project/:id", checkAuth, async (req, res) => {
  // Project page with dynamic project ID
  var proj = await Projects.findOne({ _id: req.params.id });
  if (!proj) return res.status(404).sendFile(cldir + "/404.html");
  var tok = res.locals.userToken;
  if (proj.mature) {
    if (!tok) return res.status(403).sendFile(__dirname+"/middleware/403.html");
    var user = await Users.findOne({ _id: tok.id });
    if (!user || !user.mature) return res.status(403).sendFile(__dirname+"/middleware/403.html");
  }
  if (tok && !proj.viewers.includes(tok.id)) proj.viewers.push(tok.id);
  proj.views++;
  sendFileReplace(res, "./client/project.html", (s) => s.replace(
    "<!--og:meta-->",
    `<meta property="og:title" content="${makeLiteralChars(proj.name)}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:image" content="${proj.thumbnail}"/>
  <meta property="og:description" content="${makeLiteralChars(proj.desc)} \n By: ${proj.poster} \n Score: ${proj.score} Views: ${proj.views}"/>
  `).replace("<!--content-->",`
    ${makeLiteralChars(proj.name)}<br>
    By: ${proj.poster}<br>
    ${makeLiteralChars(proj.desc)}<br>
    <a href="${proj.link}">${proj.link}</a><br>
    ${proj.tags.map(v=>"#"+v).join(", ")}<br>
    Score: ${proj.score} Views: ${proj.views} Platform: ${proj.platform} Featured: ${proj.featured}
  `).replace("<!--title-->",`
    <title>${makeLiteralChars(proj.name)} | WatermelonKatana</title>
  `));
  await proj.save();
});
app.get("/project/:id/edit", userAuth, async (req, res) => {
  const project = await Projects.findOne({ _id: req.params.id });
  const tok = res.locals.userToken;
  if (!tok || (project.posterId !== tok.id && tok.role !== "Admin")) 
    return res.status(403).sendFile(__dirname+"/middleware/403.html");
  res.sendFile(cldir + "/edit.html");
}); // Edit project page, users only
app.get("/project/:id/delete", userAuth, (req, res) =>
  res.redirect("/api/project/delete/" + req.params.id),
); // Delete project route, users only

// Posts
app.get("/forum", (req, res) => res.sendFile(cldir + "/forum.html")); // Forum Home/Search
app.get("/forum/post", userAuth, (req, res) =>
  res.sendFile(cldir + "/post.html"),
); // Publish page, users only
const Posts = require("./Database/model/Posts"); // Post page with dynamic post ID
app.get("/forum/discussion/:id", checkAuth, async (req, res) => {
  var post = await Posts.findOne({ _id: req.params.id });
  if (!post) return res.status(404).sendFile(cldir + "/404.html");
  var tok = res.locals.userToken;
  if (post.mature) {
    if (!tok) return res.status(403).sendFile(__dirname+"/middleware/403.html");
    var user = await Users.findOne({ _id: tok.id });
    if (!user || !user.mature) return res.status(403).sendFile(__dirname+"/middleware/403.html");
  }
  if (tok && !post.viewers.includes(tok.id)) post.viewers.push(tok.id);
  post.views++;
  sendFileReplace(res, "./client/discussion.html", (s) => s.replace(
    "<!--og:meta-->",
    `<meta property="og:title" content="${makeLiteralChars(post.name)}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:description" content="${makeLiteralChars(post.content)} \n By: ${post.poster} \n Views: ${post.views}"/>
  `).replace("<!--content-->",`
    ${makeLiteralChars(post.name)}<br>
    By: ${post.poster}<br>
    ${makeLiteralChars(post.content)}<br>
    ${post.tags.map(v=>"#"+v).join(", ")}<br>
    Views: ${post.views} Featured: ${post.featured}
  `).replace("<!--title-->",`
    <title>${makeLiteralChars(post.name)} | WatermelonKatana</title>
  `));
  await post.save();
});
app.get("/forum/discussion/:id/edit", userAuth, async (req, res) => {
  const post = await Posts.findOne({ _id: req.params.id });
  const tok = res.locals.userToken;
  if (!tok || (post.posterId !== tok.id && tok.role !== "Admin")) 
    return res.status(403).sendFile(__dirname+"/middleware/403.html");
  res.sendFile(cldir + "/editpost.html");
}); // Edit post page, users only
app.get("/forum/discussion/:id/delete", userAuth, (req, res) =>
  res.redirect("/api/project/delete/" + req.params.id),
); // Delete post route, users only

// User profile page with dynamic user name
app.get("/user/:name", async (req, res) => {
  var user = await Users.findOne({ username: req.params.name });
  if (!user) {
    res.status(404).sendFile(cldir + "/404.html");
    return;
  }
  sendFileReplace(res, "./client/user.html", (s) => s.replace(
    "<!--og:meta-->",
    `<meta property="og:title" content="@${user.username} on WatermelonKatana"/>
  <meta property="og:type" content="website"/>
  <meta property="og:image" content="${user.avatar}"/>
  <meta property="og:description" content="${makeLiteralChars(user.biography)}"/>
  `).replace("<!--content-->",`
    ${user.username}<br>
    ${makeLiteralChars(user.biography)}<br>
    ${user.badges.join(", ")}<br>
    Role: ${user.role}
  `).replace("<!--title-->",`
    <title>${user.username} | WatermelonKatana</title>
  `));
});

// User self profile page, users only
app.get("/profile", userAuth, (req, res) =>
  res.sendFile(cldir + "/profile.html"),
);
// User edit self page, users only
app.get("/profile/edit", userAuth, (req, res) =>
  res.sendFile(cldir + "/editprofile.html"),
);
// User change password page, users only
app.get("/profile/chpass", userAuth, (req, res) =>
  res.sendFile(cldir + "/chpass.html"),
);
// Notification
const { openNotification } = require("./API/Auth/auth");
app.get("/notification/:index", userAuth, openNotification);
// Report
const { openReport } = require("./API/Admin/admin");
app.get("/report/:id", adminAuth, openReport);

// TurboWarp page
app.get("/turbowarp", (req, res) =>
  res.sendFile(cldir + "/turbowarp/index.html"),
);

/**
 * Start the server and listen on the specified port
 */
const server = app.listen(PORT, () => {
  console.log(`Server Connected to port ${PORT}`);
});

// 404 response page
app.use((req, res) => res.status(404).sendFile(cldir + "/404.html"));

// Set server timeout to 30 seconds
server.setTimeout(30000);

/**
 * Handle unhandled promise rejections
 */
process.on("unhandledRejection", (err) => {
  console.log(`An error occurred: ${err.message}`);
  console.log(err);
  // Uncomment the line below to close the server on unhandled rejection
  // server.close(() => process.exit(1));
});
