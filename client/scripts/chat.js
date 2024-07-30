(async function(){
  var widgetBot = document.getElementById("widgetBot");
  var data = await getAuth();
  console.log(data);
  if (!data.auth) return;
  var avatar = data.user.avatar||"https://t4.ftcdn.net/jpg/03/59/58/91/360_F_359589186_JDLl8dIWoBNf1iqEkHxhUeeOulx0wOC5.jpg";
  var username = data.user.username;
  widgetBot.outerHTML = `
  <widgetbot server="1250572359077724291" channel="1250572359467925570" id="widgetBot" avatar="${avatar}" username="${username}"></widgetbot>
  <script src="https://cdn.jsdelivr.net/npm/@widgetbot/html-embed"></script>
  <script>console.log(1);</script>`;
})();