
/*
  Why can't we just implement the navbar as a js file lol
*/
document.addEventListener("DOMContentLoaded", async function() {
  const style = document.createElement("style");
  style.textContent = `
    .topnav {
  overflow: hidden;
      background-color: #333;
      color: #000;
      height: 2.5em;
      font-size: 1em;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      position: fixed;
      top: 0;
      left: 0;
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
    .signedin {
      position: fixed;
      right: 3px;
      top:3px;
      height: calc(2.5em - 7px);
      border: 1px solid #ddd;
      border-radius: 10px;
      z-index: 1001;
      color: #f2f2f2;
      background-color: #333;
      text-align: center;
      text-decoration: none;
      display: flex;
    }
    .signedin:hover {
      background-color: #ddd;
      color: black;
    }
    .signedin-avatar {
      width: 2em;
      height: 2em;
      border-radius: 50%;
      padding: 0px;
      margin: 0px;
      display: inline-flex;
    }
    .signedin-username {
      padding: 0px;
      margin: 7px;
      display: inline-flex;
    }
    #block {
      height: 2.5em;
	  width: 100%;
    }
.
  `;
  document.head.append(style);

  var navbarHtml = `
  <div class="topnav">
    <a href="/">Home</a>
    <a href="/chat">Chat</a>
    <a href="/search">Project Gallery</a>
    <a href="/forum">Forum</a>
  </div>
  <div id="block"></div>
  `;
  var auth = await getAuth();
  if (auth.user) {
    navbarHtml += `
    <a class="signedin" href="/profile">
      <img class="signedin-avatar" src="${auth.user.avatar}">
      <p class="signedin-username">${auth.user.username}</p>
    </a>
    `;
  }

  const navbarContainer = document.createElement("div");
  navbarContainer.innerHTML = navbarHtml;

  document.body.prepend(navbarContainer);
});
