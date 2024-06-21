location.path = location.pathname.split("/");
async function getAuth() {
  const res = await fetch("/api/auth/check");
  const data = await res.json();
  if (res.status > 206) throw Error(data);
  return data;
}
function projHTML(list) {
  return function(proj) {
    let div = `<div class="project-panel">
    <a href="/project/${proj.id}">
      <img class="project-thumbnail" src="${proj.thumbnail||"/images/placeholders/PLACEHOLDER_pfp.png"}"> <br>
      ${proj.name}<br>
      </a>
      By: <a href="/user/${proj.poster}">${proj.poster}</a><br>
      Score: ${proj.score} Views: ${proj.views} <br>
    </div>`
    list.innerHTML += div;
  };
}