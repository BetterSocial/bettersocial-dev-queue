const fs = require("fs");
module.exports = async (req, res) => {
  let rawdata = fs.readFileSync("hook.json");
  let data = JSON.parse(rawdata);

  res.send(data);
};
