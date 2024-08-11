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

function makeLiteralChars(string) {
  string = string.replace(/\&/g,"&amp;");
  string = string.replace(/</g,"&lt;");
  string = string.replace(/>/g,"&gt;");
  string = string.replace(/"/g,"&quot;");
  string = string.replace(/'/g,"&apos;");
  //string = string.replace(/ /g,"&nbsp;");
  return string;
}

function convertMarkdown(string) {
  string = makeLiteralChars(string);
  var escapable = "*_~`()[]\\!";
  for (var i = 0; i < escapable.length; i++) {
    string = string.replace("\\"+escapable[i],"&#"+escapable.charCodeAt(i)+";");
  }
  string = string.replace(/\*\*([^*\n]+)\*\*/g,"<b>$1</b>");
  string = string.replace(/\*([^*\n]+)\*/g,"<i>$1</i>");
  string = string.replace(/__([^*\n]+)__/g,"<u>$1</u>");
  string = string.replace(/_([^*\n]+)_/g,"<i>$1</i>");
  string = string.replace(/~~([^*\n]+)~~/g,"<s>$1</s>");
  string = string.replace(/!\[([^\]"'>]*)\]\((https?:\/\/[^\)"]+)\)/g,"<img src=\"$2\" $1>");
  string = string.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\)"\n]+)\)/g,"<a href=\"$2\">$1</a>");
  string = string.replace(/\n/g,"<br>");
  return string;
}

function previewContent(str,len) {
  return makeLiteralChars(str).replace(/\n[^]*$/,"").slice(0,len)+((str.includes("\n")||str.length>len)?"...":"");
}

function projHTML(list) {
  return function (proj) {
    let div = `<div class="project-panel" onclick="location.assign('/project/${proj.id}');">
      <div class="thumbnail-border"><img class="project-thumbnail" src="${proj.thumbnail || "/images/placeholders/PLACEHOLDER_project.png"}"></div>
      <div class="project-link">${previewContent(proj.name, 100)}</div>
      <div>By: <a href="/user/${proj.poster}">${proj.poster}</a></div>
      <div>Score: ${proj.score} Views: ${proj.views}</div>
    </div>`;
    list.innerHTML += div;
    let lastThumbnail = list.children[list.children.length - 1].querySelector(".project-thumbnail");
    if (!lastThumbnail.getAttribute("src")) lastThumbnail.src = "/images/placeholders/PLACEHOLDER_project.png";
  };
}

function forumHTML(list) {
  return function (proj) {
    let div = `<div class="post-panel" onclick="location.assign('/forum/discussion/${proj.id}');">
    <div class="post-top">
      ${previewContent(proj.name, 100)} | By: <a href="/user/${proj.poster}">${proj.poster}</a> | Views: ${proj.views} | ${relativeDate(proj.postedAt)}
    <br>
    ${previewContent(proj.content,100)}
    </div>
    </div>`;
    list.innerHTML += div;
  };
}

function userHTML(list) {
  return function (user) {
    let div = `<div class="user-panel" onclick="location.assign('/user/${user.username}');">
      <div class="comment-top">
      <img class="comment-avatar" src="${user.avatar || "/images/placeholders/PLACEHOLDER_project.png"}">
      <div class="comment-username">${user.username}</div>
      </div>
      ${previewContent(user.biography,100)}
      <div>Joined on ${new Date(user.joinedAt).toUTCString().replace(/\d\d:[^]+$/,"")} | ${user.role} </div>
    </div>`;
    list.innerHTML += div;
  };
}
