async function listComments(list,comments,self,onsend) {
  var users = {};
  users[self.id] = self;
  for (var c of comments) {
    var u = users[c.posterId];
    if (!u) {
      var res = await fetch("/api/auth/userdata?id="+c.posterId);
      u = await res.json();
      users[c.posterId] = u;
    }
    var div = `
    <div class="comment">
      <div class="comment-top">
        <img class="comment-avatar" src="${u.avatar}">
        <p class="comment-username">${u.username}</p>
        <p class="comment-data">${relativeDate(c.postedAt)}</p>
      </div>
      <p class="comment-content">${c.content}</p>
    </div>`;
    list.innerHTML += div;
  }
  var repbtn = `
  <button class="comment" id="reply-btn">
    <div class="comment-top">
      <img class="comment-avatar" src="${self.avatar}">
      <p class="comment-username">${self.username}</p>
    </div>
    <p class="comment-content">Write a reply...</p>
  </button>`;
  list.innerHTML += repbtn;
  var rep = setupReply(onsend,()=>rep.style.display = "none",self);
  document.querySelector("#reply-btn").onclick = ()=>rep.style.display = "block";
}
function setupReply(onsend,oncancel,self) {
  document.body.innerHTML += `
  <div id="reply">
    <div class="comment-top">
      <img class="comment-avatar" src="${self.avatar}">
      <p class="comment-username">${self.username}</p>
    </div>
    <textarea id="reply-textbox" oninput="growtextarea(this)" resize=false placeholder="Write a reply..."></textarea>
    <input type="button" id="send-reply-btn" value="send">
    <input type="button" id="cancel-reply-btn"  value="cancel">
  </div>`;
  document.querySelector("#send-reply-btn").onclick = ()=>{
    var txt = document.querySelector("#reply-textbox");
    onsend(txt.value);
  };
  document.querySelector("#cancel-reply-btn").onclick = oncancel;
  return document.querySelector("#reply");
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
