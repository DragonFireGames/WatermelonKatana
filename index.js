/**
 * Import necessary modules and dependencies
 */
const express = require("express");
const connectDB = require("./db");
const app = express();
const cookieParser = require("cookie-parser");
const { adminAuth, userAuth } = require("./middleware/auth.js");
const { Turbo } = require("./client/Turbo/index");
const PORT = process.env.PORT || 3000;

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
app.use("/api/auth", require("./Auth/route")); // Authentication routes
app.use("/api/project", require("./Project/route")); // Project routes

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

// Logout route: clear the JWT cookie and redirect to home
app.get("/logout", (req, res) => {
	res.cookie("jwt", "", { maxAge: "1" });
	res.redirect("/");
});

// Admin page, protected by admin authentication middleware
app.get("/admin", adminAuth, (req, res) => res.sendFile(cldir + "/admin.html"));

// Basic user page, protected by user authentication middleware
app.get("/basic", userAuth, (req, res) => res.sendFile(cldir + "/basic.html"));

// Publish page, protected by user authentication middleware
app.get("/publish", userAuth, (req, res) => res.sendFile(cldir + "/publish.html"));

// Project page with dynamic project ID
app.get("/project/:id", (req, res) => res.sendFile(cldir + "/project.html"));

// Edit project page, protected by user authentication middleware
app.get("/project/:id/edit", userAuth, (req, res) => res.sendFile(cldir + "/edit.html"));

// Delete project route, protected by user authentication middleware
app.get("/project/:id/delete", userAuth, (req, res) => res.redirect("/api/project/delete/" + req.params.id));

// User profile page with dynamic user name
app.get("/user/:name", (req, res) => res.sendFile(cldir + "/user.html"));

// User self profile page, protected by user authentication middleware
app.get("/profile", userAuth, (req, res) => res.sendFile(cldir + "/profile.html"));

// User edit self page, protected by user authentication middleware
app.get("/profile/edit", userAuth, (req, res) => res.sendFile(cldir + "/editprofile.html"));

// User change password page, protected by user authentication middleware
app.get("/profile/chpass", userAuth, (req, res) => res.sendFile(cldir + "/chpass.html"));

// TurboWarp page
app.get("/turbowarp", (req, res) => res.sendFile(cldir + "/turbowarp/index.html"));

/**
 * Start the server and listen on the specified port
 */
const server = app.listen(PORT, () => {
	console.log(`Server Connected to port ${PORT}`);
});

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
