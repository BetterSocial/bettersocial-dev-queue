const express = require("express");

const { createQueueNews } = require("../webhook/setNews");
const { setTestAddUserPostComment } = require("../webhook/setTestAddUserPostComment");
const { setTestDeleteUserPostComment } = require("../webhook/setTestDeleteUserPostComment");
const { setTestRegisterV2 } = require("../webhook/setTestRegisterV2");
// const { testRss } = require("../webhook/testRss");
const router = express.Router();

router.post("/message-posted", createQueueNews);
// router.post("/test", serviceTestQueue);
// router.post("/test-rss", testRss);
// router.post("/test/credder", setTestCredder)
// router.post("/test/add-user-post-comment", setTestAddUserPostComment)
// router.post("/test/delete-user-post-comment", setTestDeleteUserPostComment)
router.post("/test/register-v2", setTestRegisterV2)
module.exports = router;
