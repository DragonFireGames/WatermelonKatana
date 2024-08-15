
document.addEventListener("DOMContentLoaded", async function() {
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fugaz+One&display=swap');

    :root {
      --palette-primary: #de6c83;
      --palette-secondary: #2cf6b3;
      --spill-color1: #de6c83;
      --spill-color2: #ff2e58;
      --spill-color3: #2cf6b3;
      --spill-color4: #00b377;

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
      overflow: visible;
      background-color: var(--navbar-bg-color);
      color: var(--navbar-font-color);
      height: 2.5em;
      font-size: 1em;
      font-family: var(--navbar-font-family);
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      padding-left: 1em;
      padding-right: 1em;
    }

    .navbar-left {
      display: flex;
      align-items: center;
    }

    .navbar-right {
      display: flex;
      align-items: center;
    }

    .navbar-name {
      font-family: var(--navbar-font-family);
      font-size: 1.5em;
      background: linear-gradient(90deg, var(--spill-color1), var(--spill-color2), var(--spill-color3), var(--spill-color4));
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      margin-right: 2em;
      position: relative;
      animation: liquidSpill 4s ease-in-out infinite;
      transition: color 0.5s ease, background 0.5s ease;
    }

    @keyframes liquidSpill {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    .navbar-name::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: inherit;
      filter: blur(15px);
      opacity: 0.7;
      z-index: -1;
      animation: liquidSpill 4s ease-in-out infinite;
    }

    .navbar-name:hover {
      background: linear-gradient(90deg, #fff, rgba(255, 255, 255, 0.5), #fff);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      animation: shimmer 2s linear infinite;
    }

    @keyframes shimmer {
      0% {
        background-position: -100% 0;
      }
      100% {
        background-position: 100% 0;
      }
    }

    .nav-btn {
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

    .nav-btn:hover {
      background-color: var(--navbar-hover-bg-color);
      color: var(--navbar-hover-font-color);
    }

    .signedin {
      height: calc(2.5em - 7px);
      border: 1px solid var(--signedin-border-color);
      border-radius: 10px;
      z-index: 1001;
      color: var(--signedin-font-color);
      background-color: var(--signedin-bg-color);
      text-align: center;
      text-decoration: none;
      display: flex;
      align-items: center;
      transition: background-color 0.3s ease, color 0.3s ease;
      margin-left: 1em;
    }

    .signedin:hover {
      background-color: var(--palette-primary);
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

    #notification-icon {
      position: relative;
      margin-right: 1em;
      cursor: pointer;
    }

    .dropdown {
      display: none;
      position: absolute;
      right: 0;
      top: 2.5em;
      background-color: var(--navbar-bg-color);
      color: var(--navbar-font-color);
      max-height: 400px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      z-index: 1002;
      border-radius: 5px;
      overflow: scroll;
    }

    .dropdown a {
      padding: 12px 16px;
      text-decoration: none;
      display: block;
      color: var(--navbar-font-color);
      border-bottom: 1px solid var(--navbar-hover-bg-color);
    }

    .dropdown a:hover {
      background-color: var(--navbar-hover-bg-color);
      color: var(--navbar-hover-font-color);
    }

    #notification-icon::after {
      content: attr(data-count);
      position: absolute;
      top: -8px;
      right: -8px;
      background: var(--palette-primary);
      color: white;
      font-size: 0.7em;
      padding: 2px 5px;
      border-radius: 50%;
      line-height: 1;
      min-width: 20px;
      text-align: center;
    }

    #block {
      height: 2.5em;
      width: 100%;
    }
  `;
  document.head.append(style);

  var navbarHtml = `
  <div class="topnav">
    <div class="navbar-left">
      <h2 class="navbar-name"><a href="/">WatermelonKatana</a></h2>
      <a class="nav-btn" href="/chat">Chat</a>
      <a class="nav-btn" href="/search">Project Gallery</a>
      <a class="nav-btn" href="/forum">Forum</a>
    </div>
    <div class="navbar-right">
  `;

  var auth = await getAuth();
  if (auth.user) {
    const notificationCount = auth.user.notifications.length;
    var notifs = await Promise.all(auth.user.notifications.map(notificationHTML));
    navbarHtml += `
    <div id="notification-icon" data-count="${notificationCount}" onclick="notificationbtnclick()">
      <img src="/svg/bell.svg" alt="Notifications">
      <div id="notification-dropdown" class="dropdown">
        ${notifs.join('')}
      </div>
    </div>
    <a class="signedin" href="/profile">
      <img class="signedin-avatar" src="${auth.user.avatar}">
      <p class="signedin-username">${auth.user.username}</p>
    </a>
    `;
  }

  navbarHtml += `
    </div>
  </div>
  <div id="block"></div>
  `;

  const navbarContainer = document.createElement("div");
  navbarContainer.innerHTML = navbarHtml;

  document.body.prepend(navbarContainer);
});

async function notificationHTML(notif) {
  var user = await getUser(notif.posterId);
  return `<a class="user-panel" href="${notif.link}">
    <div class="comment-top">
    <img class="comment-avatar" src="${user.avatar || "/images/placeholders/PLACEHOLDER_project.png"}">
    <div class="comment-username">${notif.title}</div>
    </div>
    ${notif.content}
    <div>${new Date(user.createdAt).toUTCString().replace(/\d\d:[^]+$/,"")}</div>
  </a>`;
}


function notificationbtnclick(){
  var dropdown = document.querySelector("#notification-dropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

setTimeout(()=>{
  window.addEventListener("click", function(e) {
    const notificationIcon = document.querySelector("#notification-icon");
    if (!notificationIcon.contains(e.target)) {
      var dropdown = document.querySelector("#notification-dropdown");
      dropdown.style.display = "none";
    }
  });
},1000);
  
