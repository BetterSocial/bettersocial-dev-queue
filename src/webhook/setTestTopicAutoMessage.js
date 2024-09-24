const {registerV2Queue, followTopicQueue} = require('../config');

const setTestTopicAutoMessage = async (req, res) => {
  try {
    /**
     * @type {RegisterV2ProcessBody}
     */
    const body = req?.body;
    const result = await followTopicQueue.add(body);

    return res.json({
      status: 'ok',
      result
    });
  } catch (error) {
    console.error('error');
    console.error(error);
    return res.json({
      ststus: 'error',
      message: error
    });
  }
};

module.exports = {setTestTopicAutoMessage};
