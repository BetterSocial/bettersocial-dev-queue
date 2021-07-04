const express = require('express');

const routing = express();
const feed = require('./feedRoute');
const news = require('./newsRoute');

routing.use(`/api/v1/feed`, feed);
routing.use(`/api/v1/news`, news);

module.exports = routing;
