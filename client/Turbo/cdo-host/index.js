// const express = require('express');
const fetch = require('cross-fetch');
const { Database } = require("./database");
const speech = require('./speech');
let initalized = false;
// const app = express();
// const argv = process.argv.slice(2);
// const folder = (argv[0] || process.cwd());
class Host {
  folder = null;
  constructor(app, dir) {
    if (typeof dir !== "string") {
      throw new Error("Not a valid turbo port")
    }
    this.folder = dir;
    if (!initalized) {
      // Applabs patch for local use
      app.get("/xhr", (req, res) => {
        recall(req.query.u, "text")
          .then(response => {
            res.set("Content-Type", response.type);
            res.send(response.data);
          })
          .catch(err => {
            res.status(err).send();
          })
      })
      // Works for audio video or images
      app.get("/media", (req, res) => {
        recall(req.query.u, "blob")
        .then(response => {
          let contentType = response.type;
          if(!contentType.startsWith("image") && !contentType.startsWith("audio")){
            throw new Error("unsupported media type")
          }
          res.set("Content-Type", contentType)
          response.data.stream().pipe(res)
        })
        .catch(err => {
          res.status(err).send();
        })
      })
      // TTS Standin for Azure
      app.get("/speech", (req, res) => {
        speech.talkStream(req.query.text, req.query.voice)
          .then(stream => {
            stream.pipe(res);
          })
          .catch(err => {
            console.log(err);
          })
      })
      initalized = true;
    }
    // this is here cuz i'm lazy af
    function recall(url, type) {
      return new Promise((resolve, reject) => {
        (function call() {
          dynamicRequest(url, type)
            .then(response => {
              resolve(response);
            })
            .catch(err => {
              if (err == 429) {
                setTimeout(call, 2e3);
                return;
              }
              reject(400);
            })
        })()
      })
    }
    function dynamicRequest(url, type) {
      return new Promise((resolve, reject) => {
        let passthrough = {};
        fetch(url)
          .then(response => {
            if (response.status < 206) {
              passthrough = { status: response.status, type: response.headers.get("Content-Type") };
              return response[type]();
            } else {
              reject(response.status);
            }
          })
          .then(data => {
            passthrough.data = data;
            resolve(passthrough);
          })
          .catch(err => {
            reject(err);
          })
      })
    }

    new Database(app, this.folder);
  }
}

module.exports = {
  Host
}