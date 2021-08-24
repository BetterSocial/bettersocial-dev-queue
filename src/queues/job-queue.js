const { newsJob } = require("../processes/news-process");
const { createPostTime } = require("../processes/post-time-process");
const {
  followLocation,
  followTopic,
  followUser,
} = require("../processes/follow-location-process");
const {
  handlerFailure,
  handlerCompleted,
  handlerStalled,
} = require("./handler");

const {
  newsQueue,
  postTimeQueue,
  locationQueue,
  followTopicQueue,
  followUserQueue,
  addUserToChannelQueue,
} = require("../config");
const { addUserToChannel } = require("../processes/chat-process");

/*
  @description initial all job queue
*/
const initQueue = () => {
  console.info("newsQueue job is working!");
  newsQueue.process(newsJob);
  newsQueue.on("failed", handlerFailure);
  newsQueue.on("completed", handlerCompleted);
  newsQueue.on("stalled", handlerStalled);

  console.info("postTimeQueue job is working!");
  postTimeQueue.process(createPostTime);
  postTimeQueue.on("failed", handlerFailure);
  postTimeQueue.on("completed", handlerCompleted);
  postTimeQueue.on("stalled", handlerStalled);

  console.info("Follow location job is working!");
  locationQueue.process(followLocation);
  locationQueue.on("failed", handlerFailure);
  locationQueue.on("completed", handlerCompleted);
  locationQueue.on("stalled", handlerStalled);

  console.log("Follow user job is working!");
  followUserQueue.process(followUser);
  followUserQueue.on("failed", handlerFailure);
  followUserQueue.on("completed", handlerCompleted);
  followUserQueue.on("stalled", handlerStalled);

  console.log("Follow topic job is working!");
  followTopicQueue.process(followTopic);
  followTopicQueue.on("failed", handlerFailure);
  followTopicQueue.on("completed", handlerCompleted);
  followTopicQueue.on("stalled", handlerStalled);

  console.log("Add new User to channel");
  addUserToChannelQueue.process(addUserToChannel);
  followTopicQueue.on("failed", handlerFailure);
  followTopicQueue.on("completed", handlerCompleted);
  followTopicQueue.on("stalled", handlerStalled);

  console.log("Add new User to Topic chat");
};

initQueue();
