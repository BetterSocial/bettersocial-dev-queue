const express = require('express');
const { refreshPostViewTime } = require("../services");

const router = express.Router();

router.get("/refresh-post-view-time", refreshPostViewTime);

module.exports = router;
