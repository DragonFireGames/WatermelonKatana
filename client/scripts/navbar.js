/*
	Why can't we just implement the navbar as a js file lol
*/
document.addEventListener("DOMContentLoaded", function() {
	const style = document.createElement("style");
	style.textContent = `
		.topnav {
			background-color: #333;
			overflow: hidden;
			width: 100%;
			box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
			position: fixed;
			top: 0;
			z-index: 1000;
		}
		.topnav a {
			float: left;
			display: block;
			color: #f2f2f2;
			text-align: center;
			padding: 14px 16px;
			text-decoration: none;
		}
		.topnav a:hover {
			background-color: #ddd;
			color: black;
		}
		#block {
			height: 2.5em;
		}
	`;
	document.head.append(style);

	const navbarHtml = `
		<div class="topnav">
			<a href="/">Home</a>
			<a href="/register">Register</a>
			<a href="/login">Login</a>
			<a href="/chat">Chat</a>
			<a href="/search">Project Gallery</a>
		</div>
		<div id="block"></div>
	`;

	const navbarContainer = document.createElement("div");
	navbarContainer.innerHTML = navbarHtml;

	document.body.insertBefore(navbarContainer, document.body.firstChild);
});