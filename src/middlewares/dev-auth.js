const auth = require('basic-auth');
require('dotenv').config();

const getAuthorizer = (name, pass) => (req, res, next) => {
  const user = auth(req);
  console.log(user, process.env.DEV_USERNAME, process.env.DEV_PASSWORD)
  if (!user || user.name !== name || user.pass !== pass) {
    res.status(401).send({error: 'Unauthorized'});
  } else {
    next();
  }
};

const dev = getAuthorizer(process.env.DEV_USERNAME, process.env.DEV_PASSWORD);

module.exports = {dev};
