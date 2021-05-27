const Bull = require('bull');
const { newsJob } = require('../processes/news-process');
const { handlerFailure, handlerCompleted, handlerStalled } = require('./handler');

const newsQueue = new Bull('newsQueue', {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
})

const initNewsQueue = () => {
  console.info('newsQueue job is working!');
  newsQueue.process(newsJob);
  newsQueue.on('failed', handlerFailure);
  newsQueue.on('completed', handlerCompleted);
  newsQueue.on('stalled', handlerStalled);
}

initNewsQueue();
