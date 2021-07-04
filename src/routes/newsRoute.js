const express = require('express');

const { createQueueNews } = require("../webhook/setNews");
const router = express.Router();

router.post("/message-posted", createQueueNews);
module.exports = router;
