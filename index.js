const express = require("express");
const connectDB = require("./db");
const app = express();
const cookieParser = require("cookie-parser");
const { adminAuth, userAuth } = require("./middleware/auth.js");
const { Turbo } = require("./client/Turbo/index");
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(cookieParser());

app.use(express.static(__dirname+"/client"));

// Turbowarp
const turbo = new Turbo(app, express.static("./client/Turbo/dependencies"))

// Routes
app.use("/api/auth", require("./Auth/route"));
app.use("/api/project", require("./Project/route"));

const cldir = __dirname+"/client";
app.get("/", (req, res) => res.sendFile(cldir+"/home.html"));
app.get("/register", (req, res) => res.sendFile(cldir+"/register.html"));
app.get("/login", (req, res) => res.sendFile(cldir+"/login.html"));
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
});
app.get("/admin", adminAuth, (req, res) => res.sendFile(cldir+"/admin.html"));
app.get("/basic", userAuth, (req, res) => res.sendFile(cldir+"/basic.html"));
app.get("/publish", userAuth, (req, res) => res.sendFile(cldir+"/publish.html"));
app.get("/project/:id", (req, res) => res.sendFile(cldir+"/project.html"));
app.get("/project/:id/edit", userAuth, (req, res) => res.sendFile(cldir+"/edit.html"));
app.get("/project/:id/delete", userAuth, (req, res) => res.redirect("/api/project/delete/"+req.params.id));
app.get("/user/:name", (req, res) => res.sendFile(cldir+"/user.html"));
app.get("/profile", userAuth, (req, res) => res.sendFile(cldir+"/profile.html"));
app.get("/turbowarp", userAuth, (req, res) => res.sendFile(cldir+"/turbowarp/index.html"));

const server = app.listen(PORT, () =>
  console.log(`Server Connected to port ${PORT}`)
);
process.on("unhandledRejection", (err) => {
  console.log(`An error occurred: ${err.message}`);
  server.close(() => process.exit(1));
});