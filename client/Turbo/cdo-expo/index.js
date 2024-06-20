const modules = {
  gamelab: require("./gle"),
  applab: require("./ale"),
};
const requests = require("./requests");

async function customExport(project) {
  let type = (
    await requests.send(
      `https://studio.code.org/v3/channels/${project}`,
      "json",
    )
  ).projectType;
  
  return (await modules[type].exportProject(project))
}

module.exports = {
  customExport,
};
