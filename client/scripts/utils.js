location.path = location.pathname.split("/");
var _auth = false;
var _authwaiting = [];
function getAuth() {
  return new Promise(async(resolve)=>{
    if (_auth) return resolve(_auth);
    _authwaiting.push(resolve);
    if (_authwaiting.length > 1) return;
    const res = await fetch("/api/auth/check");
    const data = await res.json();
    if (res.status > 206) throw Error(data);
    for (var i = 0; i < _authwaiting.length; i++) _authwaiting[i](data);
    _auth = data;
  });
}

function projHTML(list) {
  HtmlSanitizer.AllowedAttributes["class"] = true;
  return function (proj) {
    let div = `<div class="project-panel">
    <a href="/project/${proj.id}">
      <div class="thumbnail-border"><img class="project-thumbnail" src="${proj.thumbnail || "/images/placeholders/PLACEHOLDER_project.png"}"></div>
      <div class="project-link">${proj.name}</div>
      </a>
      <div>By: <a href="/user/${proj.poster}">${proj.poster}</a></div>
      <div>Score: ${proj.score} Views: ${proj.views}</div>
    </div>`;

    list.innerHTML += HtmlSanitizer.SanitizeHtml(div);
    let lastThumbnail = list.children[list.children.length - 1].querySelector(".project-thumbnail");
    if (!lastThumbnail.getAttribute("src"))lastThumbnail.src = "/images/placeholders/PLACEHOLDER_project.png";
  };
}

