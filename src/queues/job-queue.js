const { newsJob } = require('../processes/news-process');
const { createPostTime } = require('../processes/post-time-process');
const { handlerFailure, handlerCompleted, handlerStalled } = require('./handler');

const { newsQueue, postTimeQueue  } = require('../config')

const initQueue = () => {
  console.info('newsQueue job is working!');
  newsQueue.process(newsJob);
  newsQueue.on('failed', handlerFailure);
  newsQueue.on('completed', handlerCompleted);
  newsQueue.on('stalled', handlerStalled);

  console.info('postTimeQueue job is working!');
  postTimeQueue.process(createPostTime);
  postTimeQueue.on('failed', handlerFailure);
  postTimeQueue.on('completed', handlerCompleted);
  postTimeQueue.on('stalled', handlerStalled);
}

initQueue();
