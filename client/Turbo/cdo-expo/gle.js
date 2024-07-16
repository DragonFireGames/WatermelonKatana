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
  let requisites = ``;
  json.libraries = json.libraries || [];
  json.libraries.forEach((library) => {
    let lib = library.name;
    let src = library.source;
    let funcs = library.functions.join("|");
    let pattern = new RegExp(`(?<!\\(\\s*|(?<!\\/\\/.*|\\/\\*[^\\*\\/]*|["'][^'"]*)function\\s+[\\S]+\\s*\\(\\)\\s*{[^}]+)function\\s+(${funcs})\\s*(?=\\()`, "g");
    src = src.replace(pattern, `var $1 = this.$1 = function`);
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
  if (animationList.orderedKeys.length < 1) {
    let prerequisites = {
      preload: "function preload() {}",
      setup: "function setup() {window.preload = null;}"
    };
    for (let req in prerequisites) {
      if (
        json.source.match(new RegExp(`^(\\s*function\\s*${req})`, "m")) ===
        null
      ) {
        requisites += `${prerequisites[req]}\n`;
      }
    }
  }
  // modified all load functions to use the API for calls
  // if this breaks anything tell me
  // if (assetList.length > 0) {
  //   json.source = json.source.replace(
  //     new RegExp(`["|'](?:sound://)(${assetList.join("|")})["|']`, "g"),
  //     `"/media?u=${soundLibrary}$1"`,
  //   );
  //   json.source = json.source.replace(
  //     new RegExp(`["|'](${assetList.join("|")})["|']`, "g"),
  //     `"/media?u=${assets}$1"`,
  //   );
  // }
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
    Object.defineProperties(Object.prototype, {
  apply: {
    value: function (fn, args) {
      if (typeof this === "object" && "length" in this) {
        return Function.prototype.apply.call(this, fn, args);
      }
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  concat: {
    value: function () {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.concat.apply(Array.from(this), Array.from(arguments));
      }
      return [];
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  every: {
    value: function (cb, _this) {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.every.call(this, cb, _this);
      }
      return false;
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  indexOf: {
    value: function (search, fromIndex) {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.indexOf.call(this, search, fromIndex);
      }
      return -1;
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  filter: {
    value: function (cb, _this) {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.filter.call(this, cb, _this);
      }
      return [];
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  forEach: {
    value: function (cb, _this) {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.forEach.call(this, cb, _this);
      }
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  join: {
    value: function (separator) {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.join.call(this, separator);
      }
      return "";
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  lastIndexOf: {
    value: function (search, fromIndex) {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.lastIndexOf.call(this, search, fromIndex);
      }
      return -1;
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  map: {
    value: function (cb, _this) {
      if (typeof this === "object" && "length" in this) {
        const mapped = [];
        for (let i in this) {
          mapped.push(cb.call(_this, this[i], Number(i)));
        }
        return mapped;
      }
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  push: {
    value: function () {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.push.apply(this, Array.from(arguments))
      }
      return 0;
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  pop: {
    value: function () {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.pop.apply(this)
      }
      return undefined;
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  reduce: {
    value: function (cb, startValue) {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.reduce.call(this, cb, startValue);
      }
      throw new TypeError("Cannot call reduce on a non-array object");
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  some: {
    value: function (cb, _this) {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.some.call(this, cb, _this);
      }
      return false;
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  shift: {
    value: function () {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.shift.call(this);
      }
      return undefined;
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  splice: {
    value: function (start, amount, ...items) {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.splice.apply(this, [start, amount, ...items]);
      }
      return [];
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  unshift: {
    value: function () {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.unshift.apply(this, Array.from(arguments));
      }
      return 0;
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  reverse: {
    value: function () {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.reverse.call(this);
      }
      return this;
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  slice: {
    value: function () {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.slice.call(this, arguments);
      }
    },
    enumerable: false,
    configurable: true,
    writable: true
  },
  sort: {
    value: function (cb) {
      if (typeof this === "object" && "length" in this) {
        return Array.prototype.sort.call(this, cb);
      }
      return this;
    },
    enumerable: false,
    configurable: true,
    writable: true
  }
})
${requisites}
// Better than eval but still unsafe;
let __script = document.createElement("script");
__script.text = ${JSON.stringify(libraries + json.source)};
document.body.appendChild(__script);

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
        let __IFRRAME__ = document.createElement("iframe");
        __IFRRAME__.srcdoc = \`<script> window.fconfig = { channel: "${id}" };
        function setExportConfig(config) { fconfig = Object.assign(fconfig, config) }
      <\\/script>
      <script src="https://studio.code.org/projects/gamelab/${id}/export_config?script_call=setExportConfig"><\\/script>
      <script src="https://code.jquery.com/jquery-1.12.1.min.js"><\\/script>
      <script src="${dependency}/gamelab-api.js"><\\/script>\`;
        document.head.appendChild(__IFRRAME__);
        __IFRRAME__.contentWindow.p5 = window.p5;
        __IFRRAME__.addEventListener("load", () => {
        const globalExports = ["fconfig", "getUserId", "setKeyValue", "getKeyValue", "getTime", "promptNum", "playSound", "playSpeech", "randomNumber", "stopSound", "initMobileControls", "showMobileControls", "timedLoop", "stopTimedLoop", "appendItem", "insertItem", "removeItem"];
        for (let global of globalExports) {
          window[global] = __IFRRAME__.contentWindow[global];
        }
        __IFRRAME__.contentDocument.getElementById = function (id) {
          return document.getElementById(id);
        }
        __IFRRAME__.contentDocument.addEventListener = function (element, event, callback) {
          return document.addEventListener(element, event, callback);
        }
        __IFRRAME__.contentDocument.body.addEventListener = function (element, event, callback) {
          return document.body.addEventListener(element, event, callback);
        }
        __IFRRAME__.contentDocument.removeEventListener = function (element, event) {
          return document.removeEventListener(element, event);
        }
        __IFRRAME__.contentDocument.body.removeEventListener = function (element, event) {
          return document.body.removeEventListener(element, event);
        }
        let script = document.createElement("script");
        script.text = ${JSON.stringify(code)};
        document.head.appendChild(script);
        // scaler
        const element = document.getElementById("sketch")
        element.style["transform"] = "scale(" + (Math.min(window.innerWidth, window.innerHeight) / 400 - 0.05) + ")";
        element.style["transform-origin"] = "top left";
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
  <div id="soft-buttons" style="z-index: -1; display: none">
    <button id="leftButton" disabled className="arrow">
    </button>
    <button id="rightButton" disabled className="arrow">
    </button>
    <button id="upButton" disabled className="arrow">
    </button>
    <button id="downButton" disabled className="arrow">
    </button>
  </div>
 <div id="studio-dpad-container" style="position:absolute; width:400px; bottom:5px; height:157px; overflow-y:hidden;z-index: -1;">
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
