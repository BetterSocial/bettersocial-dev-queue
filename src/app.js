require('dotenv').config();
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require('cors')
const compress = require('compression')
const methodOverride = require('method-override')
const helmet = require('helmet')
const routing = require("./routes");
const { notFoundHandler, errorHandler } = require("./utils");

const app = express();
app.use(compress()); // gzip compression
app.use(methodOverride()); // lets you use HTTP verbs
app.use(helmet()); // secure apps by setting various HTTP headers
app.use(cors()); // enable cors
app.options('*', cors()); // cors setup
app.use(logger("combined"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(cookieParser());
app.get('/favicon.ico', (_req, res) => {
  res.status(204)
  res.end()
});
app.use(routing); // routing
app.use(notFoundHandler); // 404 handler
app.use(errorHandler); // error handlerr

app.listen(3001, () => {console.log('======== queue running ========')})

module.exports = app;
