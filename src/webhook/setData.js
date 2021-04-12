const fs = require("fs");
module.exports = async (req, res) => {
  let currentdate = new Date();
  let date =
    currentdate.getDate() +
    "/" +
    (currentdate.getMonth() + 1) +
    "/" +
    currentdate.getFullYear() +
    " " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes() +
    ":" +
    currentdate.getSeconds();
  let data = {
    body: req.body,
    header: req.headers,
    accessedOn: date,
  };
  let dataJSON = JSON.stringify(data);
  fs.writeFileSync("hook.json", dataJSON);
  console.log(data);
  res.send(data);
};
