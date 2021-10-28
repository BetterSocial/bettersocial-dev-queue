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
  testQueue,
  addUserToChannelQueue,
  addUserToTopicChannelQueue,
} = require("../config");

const {
  addUserToChannel,
  addUserToTopicChannel,
} = require("../processes/chat-process");

/*
  @description initial all job queue
*/
const initQueue = () => {
  console.info("newsQueue job is working!");
  newsQueue.process(newsJob);
  newsQueue.on("failed", handlerFailure);
  newsQueue.on("completed", handlerCompleted);
  newsQueue.on("stalled", handlerStalled);
  // newsQueue.on("error", (err) => {
  //   console.log("newsQueue error : ", err);
  // });

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

  console.log("Add new User to channel job is working");
  addUserToChannelQueue.process(addUserToChannel);
  addUserToChannelQueue.on("failed", handlerFailure);
  addUserToChannelQueue.on("completed", handlerCompleted);
  addUserToChannelQueue.on("stalled", handlerStalled);

  console.log("Add new user To topic channel job is working");
  addUserToTopicChannelQueue.process(addUserToTopicChannel);
  addUserToTopicChannelQueue.on("failed", handlerFailure);
  addUserToTopicChannelQueue.on("completed", handlerCompleted);
  addUserToTopicChannelQueue.on("stalled", handlerStalled);

  console.info("testQueue job is working!");
  testQueue.process((job) => {
    console.log("testQueue run job test ", job.data);
  });
  testQueue.on("failed", handlerFailure);
  testQueue.on("completed", handlerCompleted);
  testQueue.on("stalled", handlerStalled);
  testQueue.on("error", (err) => {
    console.log("newsQueue error : ", err);
  });
};

initQueue();
