const CryptoUtils = require('../../../utils/crypto');
const {User} = require('../../models');

module.exports = async (signedUserId) => {
  // Get the anonymous username for the given signed user ID
  const anonymousUsername = CryptoUtils.getAnonymousUsername(signedUserId);
  let anonymousUser;
  try {
    anonymousUser = await User.findOne({
      where: {
        username: anonymousUsername
      },
      attributes: ['user_id'],
      raw: true
    });
  } catch (error) {
    console.error('Error occurred while executing findOne:', error);
    return null;
  }
  return anonymousUser ? anonymousUser.user_id : null;
};
