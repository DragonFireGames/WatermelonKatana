document.addEventListener("DOMContentLoaded", async function() {
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fugaz+One&display=swap');

    :root {
      --palette-primary: #de6c83;
      --palette-secondary: #2cf6b3;
    
      --navbar-bg-color: #333;
      --navbar-font-color: #f2f2f2;
      --navbar-hover-bg-color: #ddd;
      --navbar-hover-font-color: black;
      --signedin-bg-color: #333;
      --signedin-border-color: #ddd;
      --signedin-font-color: #f2f2f2;
      --signedin-hover-bg-color: #ddd;
      --signedin-hover-font-color: black;
      --navbar-font-family: "Fugaz One", sans-serif;
    }

    .topnav {
      overflow: hidden;
      background-color: var(--navbar-bg-color);
      color: var(--navbar-font-color);
      height: 2.5em;
      font-size: 1em;
      font-family: var(--navbar-font-family);
      display: flex;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      padding-left: 1em;
    }
    .navbar-name {
		  background: linear-gradient(177deg, var(--palette-primary), var(--palette-secondary));
		  -webkit-background-clip: text;
		  -webkit-text-fill-color: transparent;
		  color: transparent;
      margin-right: 2em;
    }
    .topnav a {
      float: left;
      display: block;
      color: var(--navbar-font-color);
      text-align: center;
      padding: 10px 14px;
      text-decoration: none;
      border-radius: 15px;
      transition: background-color 0.3s ease, color 0.3s ease;
      margin-right: 0.5em;
    }
    .topnav a:hover {
      background-color: var(--navbar-hover-bg-color);
      color: var(--navbar-hover-font-color);
    }
    .signedin {
      position: fixed;
      right: 3px;
      top: 3px;
      height: calc(2.5em - 7px);
      border: 1px solid var(--signedin-border-color);
      border-radius: 10px;
      z-index: 1001;
      color: var(--signedin-font-color);
      background-color: var(--signedin-bg-color);
      text-align: center;
      text-decoration: none;
      display: flex;
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    .signedin:hover {
      background-color: var(--signedin-hover-bg-color);
      color: var(--signedin-hover-font-color);
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
  `;
  document.head.append(style);

  var navbarHtml = `
  <div class="topnav">
    <h2 class="navbar-name">WatermelonKatana</h2>
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
