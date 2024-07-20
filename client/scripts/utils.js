location.path = location.pathname.split("/");
async function getAuth() {
  const res = await fetch("/api/auth/check");
  const data = await res.json();
  if (res.status > 206) throw Error(data);
  return data;
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
