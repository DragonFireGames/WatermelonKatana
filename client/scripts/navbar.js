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
      justify-content: space-between;
      width: 100%;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      position: fixed;
      top: 0;
      z-index: 1000;
      padding: 0 1em;
    }
    .nav-links {
      display: flex;
      align-items: center;
    }
    .nav-links a {
      color: #f2f2f2;
      text-align: center;
      padding: 14px 16px;
      text-decoration: none;
    }
    .nav-links a:hover {
      background-color: #ddd;
      color: black;
    }
    .signedin {
      height: calc(2.5em - 7px);
      border: 1px solid #ddd;
      border-radius: 10px;
      color: #f2f2f2;
      background-color: #333;
      text-align: center;
      text-decoration: none;
      display: flex;
      align-items: center;
      padding: 0 10px;
      margin-left: auto;
    }
    .signedin:hover {
      background-color: #ddd;
      color: black;
    }
    .signedin-avatar {
      width: 2em;
      height: 2em;
      border-radius: 50%;
      margin-right: 10px;
    }
    .signedin-username {
      margin: 0;
      display: flex;
      align-items: center;
    }
    #block {
      height: 2.5em;
      width: 100%;
    }
  `;
  document.head.append(style);

  var navbarHtml = `
  <div class="topnav">
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/chat">Chat</a>
      <a href="/search">Gallery</a>
    </div>
    <div id="block"></div>
  </div>
  `;
  var auth = await getAuth();
  if (auth.auth) {
    navbarHtml += `
    <a class="signedin" href="/profile">
      <img class="signedin-avatar" src="${auth.user.avatar}">
      <p class="signedin-username">${auth.user.username}</p>
    </a>
    `;
  }

  document.body.insertAdjacentHTML('afterbegin', navbarHtml);
});
