const ioredisMock = require('ioredis-mock');

// fix Bull trying to get variable from options
ioredisMock.prototype.options = {};

module.exports = ioredisMock;
