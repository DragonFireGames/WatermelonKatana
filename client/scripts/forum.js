async function listComments(list,comments,self,events) {
  var users = {};
  if (self) users[self.id] = self;
  for (var i = 0; i < comments.length; i++) {
    var c = comments[i];
    var u = users[c.posterId];
    if (!u) {
      var res = await fetch("/api/auth/userdata?id="+c.posterId);
      u = await res.json();
      users[c.posterId] = u;
    }
    var options = `<input type="button" value="reply" onclick="window.onreplybtnclick(${i});">`;
    if (self.id == c.posterId) {
      options += `<input type="button" value="edit" onclick="window.oneditbtnclick(${i});">`;
    }
    if (self.id == c.posterId || u.role == "Admin") {
      options += `<input type="button" style="color:red;" value="delete" onclick="window.ondeletebtnclick(${i});">`;
    }
    var div = `
    <div class="comment">
      <div class="comment-menu">
        <img class="comment-menu-img" src="https://www.svgrepo.com/show/124304/three-dots.svg">
        <div class="comment-menu-options">
          ${options}
        </div>
      </div>
      <div class="comment-top">
        <img class="comment-avatar" src="${u.avatar}">
        <p class="comment-username">${u.username}</p>
        <p class="comment-data">${relativeDate(c.postedAt)}</p>
      </div>
      <div class="comment-upvote">
        ${c.upvotes.length}
        <input class="comment-upvote-box" name="comment-vpvote" type="checkbox" value="reply" ${c.upvotes.includes(self.id) ? "checked" : ""} onclick="window.onupvoteclick(${i},this.checked);">
      </div>
      <p class="comment-content">${c.content}</p>
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
    var content = comments[index].content;
    content = content.replace("<br>","\n");
    var txt = document.querySelector("#reply-textbox");
    var oldmsg = txt.value;
    txt.value = content;
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
    var content = txt.value;
    content = content.replace("\n","<br>");
    if (window.editingMsg) {
      events.onedit(content,window.editingMsg.index);
    } else {
      events.onsend(content);
    }
  };
  window.onreplycancelclick = oncancel;
}
function growtextarea(ta) {
  ta.style.height = ""; /* Reset the height*/
  ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
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

function eventComments(name) {
  return {
    onsend:async(content)=>{
      const res = await fetch("/api/"+name+"/comment/"+pid, {
        method: "POST",
        body: JSON.stringify({
          content: content
        }),
        headers: { "Content-Type": "application/json" },
      });
      location.assign(location.pathname);
    },
    onedit:async(content,index)=>{
      const res = await fetch("/api/"+name+"/comment/"+pid+"/edit", {
        method: "POST",
        body: JSON.stringify({
          content: content,
          index: index
        }),
        headers: { "Content-Type": "application/json" },
      });
      location.assign(location.pathname);
    },
    ondelete:async(index)=>{
      const res = await fetch("/api/"+name+"/comment/"+pid+"/delete", {
        method: "DELETE",
        body: JSON.stringify({
          index: index
        }),
        headers: { "Content-Type": "application/json" },
      });
      location.assign(location.pathname);
    },
    onupvote:async(index,checked)=>{
      const res = await fetch("/api/"+name+"/comment/"+pid+"/"+(checked?"up":"down")+"vote?index="+index);
      location.assign(location.pathname);
    }
  };
}
