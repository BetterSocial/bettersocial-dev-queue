const express = require('express');
const statusHealthService = require('../services/status-health.service');

const router = express.Router();

router.get('/ready', async (_req, res) => {
  const isReady = await statusHealthService.isReady();
  if (isReady) {
    res.status(200).send();
  } else {
    res.status(503).json({message: 'Service unavailable'});
  }
});

router.get('/live', async (_req, res) => {
  res.status(200).send();
});

module.exports = router;
