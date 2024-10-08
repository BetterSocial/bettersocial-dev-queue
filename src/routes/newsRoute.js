const express = require('express');

const {createQueueNews} = require('../webhook/setNews');
const {testMsgFormat} = require('../webhook/testMsgFormat');
const {setTestAddUserPostComment} = require('../webhook/setTestAddUserPostComment');
const {setTestDeleteUserPostComment} = require('../webhook/setTestDeleteUserPostComment');
const {setTestRegisterV2} = require('../webhook/setTestRegisterV2');
const {setTestTopicAutoMessage} = require('../webhook/setTestTopicAutoMessage');

const router = express.Router();

router.post('/message-posted', createQueueNews);
// router.post('/test/message-format', testMsgFormat);
// router.post("/test", serviceTestQueue);
// router.post("/test-rss", testRss);
// router.post("/test/credder", setTestCredder)
// router.post("/test/add-user-post-comment", setTestAddUserPostComment)
// router.post("/test/delete-user-post-comment", setTestDeleteUserPostComment)
// router.post('/test/register-v2', setTestRegisterV2);
router.post('/test/topic-auto-message', setTestTopicAutoMessage);
module.exports = router;
