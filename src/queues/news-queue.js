const { newsJob } = require('../processes/news-process');
const { handlerFailure, handlerCompleted, handlerStalled } = require('./handler');

const { newsQueue  } = require('../config')

const initNewsQueue = () => {
  console.info('newsQueue job is working!');
  newsQueue.process(newsJob);
  newsQueue.on('failed', handlerFailure);
  newsQueue.on('completed', handlerCompleted);
  newsQueue.on('stalled', handlerStalled);
}

initNewsQueue();
