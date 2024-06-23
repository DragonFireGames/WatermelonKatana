// const fs = require("fs");
const request = require("./requests");
const startPath = "https://studio.code.org";
const soundLibrary = `${startPath}/api/v1/sound-library/`;
const assetList = [];
let animations = `${startPath}/v3/animations/`;
let assets = `${startPath}/v3/assets/`;

async function exportProject(id) {
  animations = `${startPath}/v3/animations/`;
  assets = `${startPath}/v3/assets/`;
  return new Promise(async (resolve, reject) => {
    animations += id + "/";
    let source = await getJSON(id);
    await getAssets(id);
    await getSounds(source.source);
    resolve(await getHTML(id, getCode(source)));
  });
}

async function getJSON(id) {
  return new Promise((resolve, reject) => {
    request
      .send(`${startPath}/v3/sources/${id}/main.json`, "json")
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

async function getAssets(id) {
  let resources = await request.send(assets + id, "json");
  assets += `${id}/`;
  for (let resource of resources) {
    assetList.push(resource.filename);
  }
}

function getCode(json) {
  let animationList = json.animations;
  let libraries = ``;
  json.libraries = json.libraries || [];
  json.libraries.forEach((library) => {
    let lib = library.name;
    let src = library.source;
    let funcs = library.functions.join("|");
    let pattern = new RegExp(`function\\s+(${funcs})\\s*(?=\\()`, "g");
    let methods = new RegExp(`(${funcs}\\s*)(?=\\()`, "g");
    src = src.replace(pattern, `this.$1 = function`);
    src = src.replace(methods, `this.$1`);
    libraries += `var ${lib} = new (function ${lib}() {\n${src}\nreturn(this)\n})()\n`;
  });
  animationList.orderedKeys.forEach((key) => {
    let animation = animationList.propsByKey[key];
    animation.rootRelativePath = `${
      animation.sourceUrl
        ? `/media?u=${startPath}/${animation.sourceUrl}`
        : `/media?u=${animations + key}.png`
    }`;
  });
  if (assetList.length > 0) {
    json.source = json.source.replace(
      new RegExp(`["|'](?:sound://)(${assetList.join("|")})["|']`, "g"),
      `"/media?u=${soundLibrary}$1"`,
    );
    json.source = json.source.replace(
      new RegExp(`["|'](${assetList.join("|")})["|']`, "g"),
      `"/media?u=${assets}$1"`,
    );
  }
  if (animationList.orderedKeys.length < 1) {
    let prerequisites = ["setup", "preload"];
    for (let req of prerequisites) {
      if (
        json.source.match(new RegExp(`^(\\s*function\\s*${req})`, "gm")) ===
        null
      ) {
        json.source = `function ${req}() {}\n` + json.source;
      }
    }
  }
  return `var p5Inst = new p5(null, 'sketch');

window.preload = function () {
  initMobileControls(p5Inst);

  p5Inst._predefinedSpriteAnimations = {};
  p5Inst._pauseSpriteAnimationsByDefault = false;
  var animationListJSON = ${JSON.stringify(animationList)}
  var orderedKeys = animationListJSON.orderedKeys;
  orderedKeys.forEach(function (key) {
    var props = animationListJSON.propsByKey[key];
    var frameCount = props.frameCount;
    var image = loadImage(props.rootRelativePath, function () {
      var spriteSheet = loadSpriteSheet(
          image,
          props.frameSize.x,
          props.frameSize.y,
          frameCount
      );
      p5Inst._predefinedSpriteAnimations[props.name] = loadAnimation(spriteSheet);
      p5Inst._predefinedSpriteAnimations[props.name].looping = props.looping;
      p5Inst._predefinedSpriteAnimations[props.name].frameDelay = props.frameDelay;
    });
  });

  function wrappedExportedCode(stage) {
    if (stage === 'preload') {
      if (setup !== window.setup) {
        window.setup = setup;
      } else {
        return;
      }
    }
    Object.defineProperty(Object.prototype, "slice", {
      value: function(){
       if(typeof this === "object" && "length" in this) {
         return Array.prototype.slice.call(this,arguments);
       } else if (Array.isArray(this)) {
         return Array.prototype.slice.apply(this, arguments);
        }
       },
       enumerable: false,
       configurable: true,
       writable: true
    })

// My shitty fix;
eval.apply(window,[${JSON.stringify(`
${libraries}
// -----
${json.source}
`)}]);

// -----
    try { window.draw = draw; } catch (e) {}
    switch (stage) {
      case 'preload':
        if (preload !== window.preload) { preload(); }
        break;
      case 'setup':
        if (setup !== window.setup) { setup(); }
        break;
    }
  }
  window.wrappedExportedCode = wrappedExportedCode;
  wrappedExportedCode('preload');
};

window.setup = function () {
  window.wrappedExportedCode('setup');
};
  `;
}

//* Old Code

async function getHTML(id, code) {
  return Promise.resolve(
    await request
      .send(`${startPath}/v3/channels/${id}`, "json")
      .then(async (data) => {
        const dependency = "/turbowarp/gamelab";
        return `<html>
  <head>
    <title> ${data.name} </title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link href="${dependency}/gamelab.css" rel="stylesheet" type="text/css">
      <script src="${dependency}/p5.js"></script>
      <script src="${dependency}/p5.play.js"></script>
      <script>
        let iframe = document.createElement("iframe");
        iframe.srcdoc = \`<script> window.fconfig = { channel: "${id}" };
        function setExportConfig(config) { fconfig = Object.assign(fconfig, config) }
      <\\/script>
      <script src="https://studio.code.org/projects/gamelab/${id}/export_config?script_call=setExportConfig"><\\/script>
      <script src="https://code.jquery.com/jquery-1.12.1.min.js"><\\/script>
      <script src="${dependency}/gamelab-api.js"><\\/script>\`;
        document.head.appendChild(iframe);
        iframe.contentWindow.p5 = window.p5;
        iframe.addEventListener("load", () => {
        const globalExports = ["getUserId", "setKeyValue", "getKeyValue", "getTime", "promptNum", "playSound", "playSpeech", "randomNumber", "stopSound", "initMobileControls", "showMobileControls"];
        for (let global of globalExports) {
          window[global] = iframe.contentWindow[global];
        }
        iframe.contentDocument.getElementById = function (id) {
          return document.getElementById(id);
        }
        iframe.contentDocument.addEventListener = function (element, event, callback) {
          return document.addEventListener(element, event, callback);
        }
        iframe.contentDocument.body.addEventListener = function (element, event, callback) {
          return document.body.addEventListener(element, event, callback);
        }
        iframe.contentDocument.removeEventListener = function (element, event) {
          return document.removeEventListener(element, event);
        }
        iframe.contentDocument.body.removeEventListener = function (element, event) {
          return document.body.removeEventListener(element, event);
        }
        let script = document.createElement("script");
        script.text = ${JSON.stringify(code)};
        script.setAttribute("namespace", "fconfig");
        document.head.appendChild(script);
      })
  </script>
  <style>
    body.expo {
      background-color: black;
    }

    #sketch.expo.no-controls {
      top: 82px;
    }
  </style>
  </head>
  <body class="web"
  style="margin:0; overflow:hidden; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none; position:fixed; top:0; left:0; width:400px; height:565px;">
  <div id="sketch" class="web" style="position:absolute;"></div>
  <div id="soft-buttons" style="display: none">
    <button id="leftButton" disabled className="arrow">
    </button>
    <button id="rightButton" disabled className="arrow">
    </button>
    <button id="upButton" disabled className="arrow">
    </button>
    <button id="downButton" disabled className="arrow">
    </button>
  </div>
  <div id="studio-dpad-container" style="position:absolute; width:400px; bottom:5px; height:157px; overflow-y:hidden;">
  </div>
</body>
</html>`;
      }),
  );
}

/*/// Breaks stuff for now, but I think this might be the way to go?

async function getHTML(id, code) {
  return Promise.resolve(
    await request
      .send(`${startPath}/v3/channels/${id}`, "json")
      .then(async (data) => {
        const dependency = "/turbowarp/gamelab";
        return `<html>
  <head>
    <title> ${data.name} </title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link href="${dependency}/gamelab.css" rel="stylesheet" type="text/css">
      <script src="${dependency}/p5.js"></script>
      <script src="${dependency}/p5.play.js"></script>
      <script>
        window.fconfig = { channel: "${id}" };
        function setExportConfig(config) { fconfig = Object.assign(fconfig, config) }
      </script>
      <script src="https://studio.code.org/projects/gamelab/${id}/export_config?script_call=setExportConfig"></script>
      <script src="https://code.jquery.com/jquery-1.12.1.min.js"></script>
      <script src="${dependency}/gamelab-api.js"></script>
      <script>
        window.addEventListener("load", () => {
          Object.assign(window, fconfig);
          eval.apply(window, [${JSON.stringify(code)}]);
        });
    </script>
    <style>
      body.expo {
        background-color: black;
      }
  
      #sketch.expo.no-controls {
        top: 82px;
      }
    </style>
  </head>
  <body class="web"
  style="margin:0; overflow:hidden; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none; position:fixed; top:0; left:0; width:400px; height:565px;">
  <div id="sketch" class="web" style="position:absolute;"></div>
  <div id="soft-buttons" style="display: none">
    <button id="leftButton" disabled className="arrow">
    </button>
    <button id="rightButton" disabled className="arrow">
    </button>
    <button id="upButton" disabled className="arrow">
    </button>
    <button id="downButton" disabled className="arrow">
    </button>
  </div>
  <div id="studio-dpad-container" style="position:absolute; width:400px; bottom:5px; height:157px; overflow-y:hidden;">
  </div>
</body>
</html>`;
      }),
  );
}

//*/

async function getSounds(json) {
  return new Promise(async (resolve, reject) => {
    const soundRegex =
      /(\bsound:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    const soundPrefix = /^sound:\/\//;
    let sounds = [...new Set(json.match(soundRegex))];
    for (let sound of sounds) {
      sound = sound.replace(soundPrefix, "");
      assetList.push(sound);
    }
    resolve(sounds);
  });
}

module.exports = {
  exportProject,
};
