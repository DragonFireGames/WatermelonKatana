location.path = location.pathname.split("/");
async function getAuth() {
  const res = await fetch("/api/auth/check");
  const data = await res.json();
  if (res.status > 206) throw Error(data);
  return data;
}
function projHTML(list) {
  return function(proj) {
    let li = `<li>
      <b>Name</b> => ${proj.name} <br> 
      <b>By</b> => <a href="/user/${proj.poster}">${proj.poster}</a><br>
      <b>Score</b> => ${proj.score}<br>
      <a class="projectplay" href="/project/${proj.id}">Open Page</a>
    </li>`
    list.innerHTML += li;
  };
}