const express = require("express");

const { createQueueNews } = require("../webhook/setNews");
const { setTestAddUserPostComment } = require("../webhook/setTestAddUserPostComment");
const { setTestDeleteUserPostComment } = require("../webhook/setTestDeleteUserPostComment");
const router = express.Router();

router.post("/message-posted", createQueueNews);
// router.post("/test", serviceTestQueue);
// router.post("/test-rss", testRss);
// router.post("/test/credder", setTestCredder)
// router.post("/test/add-user-post-comment", setTestAddUserPostComment)
// router.post("/test/delete-user-post-comment", setTestDeleteUserPostComment)
module.exports = router;
