const express = require("express");

const { createQueueNews } = require("../webhook/setNews");
const { serviceTestQueue } = require("../webhook/setTest");
const router = express.Router();

router.post("/message-posted", createQueueNews);
// router.post("/test", serviceTestQueue);
module.exports = router;
