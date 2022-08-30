const express = require("express");

const { createQueueNews } = require("../webhook/setNews");
const { serviceTestQueue } = require("../webhook/setTest");
const { setTestCredder } = require("../webhook/setTestCredder");
const { testRss } = require("../webhook/testRss");
const router = express.Router();

router.post("/message-posted", createQueueNews);
// router.post("/test", serviceTestQueue);
// router.post("/test-rss", testRss);
// router.post("/test/credder", setTestCredder)
module.exports = router;
