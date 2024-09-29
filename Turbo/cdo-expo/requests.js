const fetch = require('cross-fetch');
function send(url, type) {
  return new Promise((resolve, reject) => {
    fetch(url).then(response => {
      if (response.status < 206) {
        return response[type]();
      } else {
        reject(response.status);
      }
    }).then(data => {
      resolve(data);
    }).catch(err => {
      reject("error request invalid");
    });
  })
}

module.exports = { send };