const momentTz = require('moment-timezone');
const {v4: uuidv4} = require('uuid');
const {sample} = require('lodash');
const {followTopicQueue} = require('../../config/redis');
const {CommunityMessageFormat, LogError} = require('../../databases/models');

const setRequiredTime = (delay) => {
  let requiredTime = momentTz().tz('America/Los_Angeles');
  if (delay === 0) {
    const randomTime = Math.floor(Math.random() * (40 - 10 + 1)) + 10;
    requiredTime = momentTz().tz('America/Los_Angeles').add(randomTime, 'minutes');
  } else {
    const randomTime = sample([6, 7, 8]);
    const additionalDays = delay;
    requiredTime = momentTz()
      .tz('America/Los_Angeles')
      .set({hour: randomTime})
      .add(additionalDays, 'days');
  }
  return requiredTime;
};
const followTopicServiceQueue = async (userId, topicId, communityMessageFormatId, delay) => {
  const data = {
    user_id: userId,
    topic_id: topicId,
    community_message_format_id: communityMessageFormatId
  };
  const currentTime = momentTz().tz('America/Los_Angeles');
  const requiredTime = setRequiredTime(delay);
  const diffTime = requiredTime.diff(currentTime, 'milliseconds');

  const options = {
    jobId: uuidv4(),
    removeOnComplete: true,
    delay: diffTime
  };
  try {
    const queueRegistered = await followTopicQueue.add(data, options);
    console.log(
      `::: followTopicServiceQueue for user_id ${userId} and communityMessageFormatId ${communityMessageFormatId} :::  ${queueRegistered.id}`
    );
  } catch (e) {
    console.log('error', e);
  }
};
const sendTopicAutoMessage = async (userId, topicIds) => {
  console.log('::: sendTopicAutoMessage when register :::', userId);
  try {
    topicIds.forEach(async (topicId) => {
      const communityMessageFormats = await CommunityMessageFormat.findAll({
        where: {topic_id: topicId, status: '1'}
      });
      console.log('::: Total communityMessageFormats :::', communityMessageFormats.length);
      if (communityMessageFormats.length > 0) {
        communityMessageFormats.forEach(async (communityMessageFormat) => {
          followTopicServiceQueue(
            userId,
            topicId,
            communityMessageFormat.community_message_format_id,
            communityMessageFormat.delay
          );
        });
      }
    });
  } catch (error) {
    await LogError.create({
      message: error.message
    });
    console.error('Register send Topic auto message: ', error);
  }
};

module.exports = sendTopicAutoMessage;
