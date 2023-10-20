const express = require('express');

const routing = express();
const feed = require('./feedRoute');
const news = require('./newsRoute');
const user = require('./userRoute');
const dev = require('./devRoute');
const statusHealthRoute = require('./status-health.route');

routing.use('/status-health', statusHealthRoute);
routing.use(`/api/v1/feed`, feed);
routing.use(`/api/v1/news`, news);
routing.use(`/api/v1/user`, user);
routing.use(`/api/v1/dev`, dev);

module.exports = routing;
