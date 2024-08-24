const gTTS = require("gtts");
const voices = [
  "af",
  "sq",
  "ar",
  "hy",
  "ca",
  "zh",
  "zh-cn",
  "zh-tw",
  "zh-yue",
  "hr",
  "cs",
  "da",
  "nl",
  "en",
  "en-au",
  "en-uk",
  "en-us",
  "eo",
  "fi",
  "fr",
  "de",
  "el",
  "ht",
  "hi",
  "hu",
  "is",
  "id",
  "it",
  "ja",
  "ko",
  "la",
  "lv",
  "mk",
  "no",
  "pl",
  "pt",
  "pt-br",
  "ro",
  "ru",
  "sr",
  "sk",
  "es",
  "es-es",
  "es-us",
  "sw",
  "sv",
  "ta",
  "th",
  "tr",
  "vi",
  "cy",
];
function talkStream(text, voice) {
  return new Promise((resolve, reject) => {
    voice = voices.indexOf(voice) ? voice : "en-us";
    let speech = new gTTS(text, voice);
    if(speech.stream) {
      resolve(speech.stream())
    } else {
      reject("could not find the stream output with the given text")
    }
  })
}
module.exports = {
  talkStream
}