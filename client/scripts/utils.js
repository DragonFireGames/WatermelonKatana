location.path = location.pathname.split("/");
var _authCache = false;
var _authwaiting = [];
function getAuth() {
  return new Promise(async(resolve)=>{
    if (_authCache) return resolve(_authCache);
    _authwaiting.push(resolve);
    if (_authwaiting.length > 1) return;
    const res = await fetch("/api/auth/check");
    const data = await res.json();
    if (res.status > 206) throw Error(data);
    for (var i = 0; i < _authwaiting.length; i++) _authwaiting[i](data);
    _authCache = data;
    if (data.user) _userCache[data.user.id] = data.user;
  });
}

var _userCache = {};
async function getUser(id) {
  if (_userCache[id]) return _userCache[id];
  var res = await fetch("/api/auth/userdata?id="+id);
  var u = await res.json();
  _userCache[id] = u;
  return u;
}

function relativeDate(time) {
  var seconds = (Date.now() - time) / 1000;

  if (time == 0) return "never";

  var interval = Math.floor(seconds / (365.25 * 24 * 60 * 60));
  if (interval == 1) return "1 year ago";
  else if (interval > 1) return interval + " years ago";
  
  interval = Math.floor(seconds / (30.4375 * 24 * 60 * 60));
  if (interval == 1) return "1 month ago";
  else if (interval > 1) return interval + " months ago";
  
  interval = Math.floor(seconds / (7 * 24 * 60 * 60));
  if (interval == 1) return "1 week ago";
  else if (interval > 1) return interval + " weeks ago";
  
  interval = Math.floor(seconds / (24 * 60 * 60));
  if (interval == 1) return "1 day ago";
  else if (interval > 1) return interval + " days ago";
  
  interval = Math.floor(seconds / (60 * 60));
  if (interval == 1) return "1 hour ago";
  else if (interval > 1) return interval + " hours ago";
  
  interval = Math.floor(seconds / (60));
  if (interval == 1) return "1 minute ago";
  else if (interval > 1) return interval + " minutes ago";
  
  interval = Math.floor(seconds);
  if (interval == 1) return "1 second ago";
  return interval + " seconds ago";
  
  //return new Date(time).toUTCString();
}

function projHTML(list) {
  HtmlSanitizer.AllowedAttributes["class"] = true;
  return function (proj) {
    let div = `<div class="project-panel" onclick="location.assign('/project/${proj.id}');">
      <div class="thumbnail-border"><img class="project-thumbnail" src="${proj.thumbnail || "/images/placeholders/PLACEHOLDER_project.png"}"></div>
      <div class="project-link">${proj.name}</div>
      <div>By: <a href="/user/${proj.poster}">${proj.poster}</a></div>
      <div>Score: ${proj.score} Views: ${proj.views}</div>
    </div>`;

    list.innerHTML += HtmlSanitizer.SanitizeHtml(div);
    let lastThumbnail = list.children[list.children.length - 1].querySelector(".project-thumbnail");
    if (!lastThumbnail.getAttribute("src"))lastThumbnail.src = "/images/placeholders/PLACEHOLDER_project.png";
  };
}


function forumHTML(list) {
  return function (proj) {
    let div = `<div class="post-panel" onclick="location.assign('/forum/discussion/${proj.id}');">
    <div class="post-top">
      ${proj.name} | By: <a href="/user/${proj.poster}">${proj.poster}</a> | Views: ${proj.views} | ${relativeDate(proj.postedAt)}
    <br>
    ${proj.content.replace(/[^\w\d\s-_]/g,"").replace(/\n[^]*$/,"").slice(0,50)}
    </div>
    </div>`;
    list.innerHTML += div;
  };
}
