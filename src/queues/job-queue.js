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
  prepopulatedDmQueue,
  registerQueue,
} = require("../config");

const {
  addUserToChannel,
  addUserToTopicChannel,
} = require("../processes/chat-process");
const { prepopulatedDm } = require("../processes/prepopulate-dm-process");
const { registerProcess } = require("../processes/register-process");

/*
  @description initial all job queue
*/
const initQueue = () => {
  console.info("newsQueue job is working!");
  newsQueue.process(newsJob);
  newsQueue.on("failed", handlerFailure);
  newsQueue.on("completed", handlerCompleted);
  newsQueue.on("stalled", handlerStalled);
  newsQueue.on("error", (err) => {
    console.log("newsQueue error : ", err);
  });
  newsQueue.on("active", (res) => {
    console.log(res);
  })

  console.info("postTimeQueue job is working!");
  postTimeQueue.process(createPostTime);
  postTimeQueue.on("failed", handlerFailure);
  postTimeQueue.on("completed", handlerCompleted);
  postTimeQueue.on("stalled", handlerStalled);

  postTimeQueue.on("error", (err) => {
    console.log("posttime error: ", err);
  })

  // console.info("Follow location job is working!");
  // locationQueue.process(followLocation);
  // locationQueue.on("failed", handlerFailure);
  // locationQueue.on("completed", handlerCompleted);
  // locationQueue.on("stalled", handlerStalled);

  // console.log("Follow user job is working!");
  // followUserQueue.process(followUser);
  // followUserQueue.on("failed", handlerFailure);
  // followUserQueue.on("completed", handlerCompleted);
  // followUserQueue.on("stalled", handlerStalled);
  // followUserQueue.on('error', (err) => {
  //   console.error('error follow user', err);
  // })

  // console.log("Follow topic job is working!");
  // followTopicQueue.process(followTopic);
  // followTopicQueue.on("failed", handlerFailure);
  // followTopicQueue.on("completed", handlerCompleted);
  // followTopicQueue.on("stalled", handlerStalled);

  // console.log("Add new User to channel job is working");
  // addUserToChannelQueue.process(addUserToChannel);
  // addUserToChannelQueue.on("failed", handlerFailure);
  // addUserToChannelQueue.on("completed", handlerCompleted);
  // addUserToChannelQueue.on("stalled", handlerStalled);

  // console.log("Add new user To topic channel job is working");
  // addUserToTopicChannelQueue.process(addUserToTopicChannel);
  // addUserToTopicChannelQueue.on("failed", handlerFailure);
  // addUserToTopicChannelQueue.on("completed", handlerCompleted);
  // addUserToTopicChannelQueue.on("stalled", handlerStalled);

  // console.log("Prepopulated dm job is working");
  // prepopulatedDmQueue.process(prepopulatedDm);
  // prepopulatedDmQueue.on("failed", handlerFailure);
  // prepopulatedDmQueue.on("completed", handlerCompleted);
  // prepopulatedDmQueue.on("stalled", handlerStalled);

  console.log('Register Queue job is working');
  registerQueue.process(registerProcess);
  registerQueue.on("failed", handlerFailure);
  registerQueue.on("completed", handlerCompleted);
  registerQueue.on("stalled", handlerStalled);

};

initQueue();
