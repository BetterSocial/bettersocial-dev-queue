const express = require("express");

const { createQueueNews } = require("../webhook/setNews");
const { testQueue } = require("../webhook/setTest");
const router = express.Router();

router.post("/message-posted", createQueueNews);
router.get("/test", testQueue);
module.exports = router;
