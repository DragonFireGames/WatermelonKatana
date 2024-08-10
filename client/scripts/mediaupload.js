(function(){
  document.body.innerHTML += `
<style>

#upload-container {
  color: #000;
  text-decoration: none;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  align-items: center;
  justify-content: center;
  overflow: show;
  padding: 5px;
  position: absolute;
  width: 80vmin;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: none;
}

#file-upload {
  margin: 0px 0px 5px 0px;
}

#upload-preview {
  max-width: 80vmin;
  max-height: 80vmin;
}

</style>
<div id="upload-container">
  <input id="file-upload" type="file" accept="image/*" onchange="setPreview()"><br>
  <img id="upload-preview"><br>
  <button id="file-upload-submit" onclick="uploadMedia()">Upload</button>
  <button id="file-upload-cancel" onclick="fileUploaded(null)">Cancel</button>
</div>`;
})();

function getFileUpload() {
  var container = document.querySelector("#upload-container");
  container.style.display = "block";
  return new Promise((resolve)=>{
    window.onfileupload = resolve;
  });
}
async function uploadMedia() {
  var elem = document.querySelector('#file-upload');
  var file = elem.files[0];
  var buf = await file.arrayBuffer();
  var b64 = _arrayBufferToBase64(buf);
  var params = new URLSearchParams();
  params.set("image",b64);
  params.set("name",file.name);
  try {
    var res = await fetch("/api/media/upload",{
      method: 'POST',
      body: params
    });
    var data = await res.json();
    if (res.status > 206) throw data;
    fileUploaded(data.url);
  } catch (error) {
    alert(JSON.stringify(error));
    console.log(error);
    fileUploaded(null);
  }
}
async function setPreview() {
  var elem = document.querySelector('#file-upload');
  var img = document.querySelector('#upload-preview');
  
  var file = elem.files[0];
  var buf = await file.arrayBuffer();

  var b64 = _arrayBufferToBase64(buf);
  var url = "data:"+file.type+";base64,"+b64;
  img.src = url;
}
function fileUploaded(url) {
  var container = document.querySelector("#upload-container");
  var img = document.querySelector('#upload-preview');
  var elem = document.querySelector('#file-upload');
  container.style.display = "none";
  img.src = "";
  elem.value = "";
  window.onfileupload(url);
}
function _arrayBufferToBase64( buffer ) {
  var binary = '';
  var bytes = new Uint8Array( buffer );
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode( bytes[ i ] );
  }
  return window.btoa( binary );
}
