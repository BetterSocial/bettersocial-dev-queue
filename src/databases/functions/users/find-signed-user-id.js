const CryptoUtils = require('../../../utils/crypto');

module.exports = async (userModel, userId, options = {}) => {
  const {shouldReturnObject = false} = options;

  const user = await userModel.findOne({
    where: {
      user_id: userId
    },
    raw: true
  });

  if (shouldReturnObject && user?.is_anonymous) {
    return {
      user_id: CryptoUtils.decryptAnonymousUserId(user?.encrypted),
      is_user_anonymous: user?.is_anonymous
    };
  }
  if (shouldReturnObject) {
    return {
      user_id: user?.user_id,
      is_user_anonymous: user?.is_anonymous
    };
  }

  if (user?.is_anonymous) return CryptoUtils.decryptAnonymousUserId(user?.encrypted);
  return user?.user_id;
};
