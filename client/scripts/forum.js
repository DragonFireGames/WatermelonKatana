
async function createPost(post,data,txt,name,reload) {
  var u = await getUser(data.posterId);
  post.innerHTML = `
  <div id="display">
    <h2 class="post-name">${makeLiteralChars(data.name)}</h2>
    <div class="comment-top">
      <a href="/user/${u.username}">
        <img class="comment-avatar" src="${u.avatar}">
        <p class="comment-username">${u.username}</p>
      </a>
      <p class="comment-data">${new Date(data.postedAt).toUTCString()}</p>
    </div>
    ${txt}
    ${data.tags.map(t=>` <a href="/search?includeTags=${t}">#${t}</a>`)} <br>
  </div>
  <div id="comments" class="comment-list">
  Comments:
  </div>
  `;
  var tok = await getAuth();
  const commentlist = document.querySelector("#comments");
  await listComments(commentlist,data.comments,tok.user,commentEvents(name,reload));
  const display = document.querySelector("#display");
  if (!tok.user) return;
  if (tok.user.role === "Admin") { 
    display.innerHTML += `
    <label for="featured-btn">Featured:
      <input
        value="featured-button"
        name="featured-btn"
        id="featured-btn"
        type="checkbox"
        ${data.featured ? "checked" : ""}
        onclick="featurebtnclick(this.checked)"
      />
      <span class="checkbox"></span>
    </label><br>`;
  } else {
    display.innerHTML += `<b>Featured</b> => ${data.featured} <br>`;
  }
  if (tok.user.id !== data.posterId && tok.user.role !== "Admin") return;
  console.log(post);
  if (name == "forum") name = "forum/discussion";
  display.innerHTML += `<a class="edit" href="/${name}/${pid}/edit"><span class="button">Edit</span></a>`;
}
async function listComments(list,comments,self,events) {
  var users = {};
  for (var i = 0; i < comments.length; i++) {
    var c = comments[i];
    var u = await getUser(c.posterId);
    if (self) {
      var options = `<input type="button" value="reply" onclick="window.onreplybtnclick(${i});">`;
      if (self.id == c.posterId) {
        options += `<input type="button" value="edit" onclick="window.oneditbtnclick(${i});">`;
      }
      if (self.id == c.posterId || u.role == "Admin") {
        options += `<input type="button" style="color:red;" value="delete" onclick="window.ondeletebtnclick(${i});">`;
      }
    }
    var div = `
    <div class="comment">
      ${self?`
      <div class="comment-menu">
        <img class="comment-menu-img" src="https://www.svgrepo.com/show/124304/three-dots.svg">
        <div class="comment-menu-options">
          ${options}
        </div>
      </div>`:""}
      <div class="comment-top">
        <a href="/user/${u.username}">
          <img class="comment-avatar" src="${u.avatar}">
          <p class="comment-username">${u.username}</p>
        </a>
        <p class="comment-data">${relativeDate(c.postedAt)}</p>
      </div>
      ${self?`<div class="comment-upvote">
        ${c.upvotes.length}
        <label>
          <input class="comment-upvote-box" name="comment-vpvote" type="checkbox" value="reply" ${c.upvotes.includes(self.id) ? "checked" : ""} onclick="window.onupvoteclick(${i},this.checked);">
          <span class="checkbox"></span>
        </label>
      </div>`:""}
      <p class="comment-content">${convertMarkdown(c.content)}</p>
    </div>`;
    list.innerHTML += div;
  }
  if (!self) return;
  var repbtn = `
  <button class="comment" id="reply-btn"  onclick="window.onreplybtnclick()">
    <div class="comment-top">
      <img class="comment-avatar" src="${self.avatar}">
      <p class="comment-username">${self.username}</p>
    </div>
    <p class="comment-content">Write a reply...</p>
  </button>`;
  list.innerHTML += repbtn;
  window.editingMsg = false;
  var rep = setupReply(events,()=>{
    if (window.editingMsg) {
      var txt = document.querySelector("#reply-textbox");
      txt.value = window.editingMsg.oldmsg;
      window.editingMsg = false;
    }
    document.querySelector("#reply").style.display = "none";
  },self);
  window.onreplybtnclick = ()=>document.querySelector("#reply").style.display = "block";
  window.oneditbtnclick = (index)=>{
    document.querySelector("#reply").style.display = "block";
    var txt = document.querySelector("#reply-textbox");
    var oldmsg = txt.value;
    txt.value = comments[index].content;
    window.editingMsg = {index,oldmsg};
  }
  window.ondeletebtnclick = events.ondelete;
  window.onupvoteclick = events.onupvote;
}
function setupReply(events,oncancel,self) {
  document.body.innerHTML += `
  <div id="reply">
    <div class="comment-top">
      <img class="comment-avatar" src="${self.avatar}">
      <p class="comment-username">${self.username}</p>
    </div>
    <textarea id="reply-textbox" oninput="growtextarea(this)" resize=false placeholder="Write a reply..."></textarea>
    <input type="button" id="send-reply-btn" value="send" onclick="window.onreplysendclick()">
    <input type="button" id="cancel-reply-btn"  value="cancel" onclick="window.onreplycancelclick()">
  </div>`;
  window.onreplysendclick = ()=>{
    var txt = document.querySelector("#reply-textbox");
    if (window.editingMsg) {
      events.onedit(txt.value,window.editingMsg.index);
    } else {
      events.onsend(txt.value);
    }
    oncancel();
  };
  window.onreplycancelclick = oncancel;
}
function growtextarea(ta) {
  ta.style.height = ""; /* Reset the height*/
  ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
}
function commentEvents(name,reload) {
  return {
    onsend:async(content)=>{
      const res = await fetch("/api/"+name+"/comment/"+pid, {
        method: "POST",
        body: JSON.stringify({
          content: content
        }),
        headers: { "Content-Type": "application/json" },
      });
      reload();
    },
    onedit:async(content,index)=>{
      const res = await fetch("/api/"+name+"/comment/"+pid+"/edit", {
        method: "PUT",
        body: JSON.stringify({
          content: content,
          index: index
        }),
        headers: { "Content-Type": "application/json" },
      });
      reload();
    },
    ondelete:async(index)=>{
      const res = await fetch("/api/"+name+"/comment/"+pid+"/delete", {
        method: "DELETE",
        body: JSON.stringify({
          index: index
        }),
        headers: { "Content-Type": "application/json" },
      });
      reload();
    },
    onupvote:async(index,checked)=>{
      const res = await fetch("/api/"+name+"/comment/"+pid+"/"+(checked?"up":"down")+"vote?index="+index);
      reload();
    }
  };
}
