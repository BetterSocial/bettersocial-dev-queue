const fs = require("fs");
module.exports = async (req, res) => {
  const fs = require("fs");

  let rawdata = fs.readFileSync("hook.json");
  let data = JSON.parse(rawdata);
  console.log(data);

  res.send(data);
};
