const express = require('express');

const routing = express();
const feed = require('./feedRoute');
const news = require('./newsRoute');
const statusHealthRoute = require('./status-health.route');

routing.use('/status-health', statusHealthRoute);
routing.use(`/api/v1/feed`, feed);
routing.use(`/api/v1/news`, news);

module.exports = routing;
