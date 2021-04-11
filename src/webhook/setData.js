const fs = require("fs");
module.exports = async (req, res) => {
  let data = {
    body: req.body,
    header: req.headers,
  };
  let dataJSON = JSON.stringify(data);
  fs.writeFileSync("hook.json", dataJSON);
  console.log(data);
  res.send(data);
};
