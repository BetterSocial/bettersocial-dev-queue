const {registerV2Queue} = require('../config');
const setTestRegisterV2 = async (req, res) => {
  try {
    /**
     * @type {RegisterV2ProcessBody}
     */
    const body = req?.body;
    const result = await registerV2Queue.add(body);

    return res.json({
      status: 'ok',
      result: result
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

module.exports = {setTestRegisterV2};
