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
        dynamicRequest(decodeURIComponent(req.query.u), "text")
          .then(response => {
            res.set("Content-Type", response.type);
            res.send(response.data);
          })
      })
      // Works for audio video or images
      app.get("/media", (req, res) => {
        dynamicRequest(req.query.u, "blob")
          .then(response => {
            res.set("Content-Type", "blob")
            response.data.stream().pipe(res)
          })
          .catch(err => {
            res.status(err)
            res.send();
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