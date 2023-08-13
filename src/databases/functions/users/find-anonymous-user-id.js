const CryptoUtils = require("../../../utils/crypto")
const { User } = require("../../models")

module.exports = async (signedUserId) => {

    const anonymousUsername = CryptoUtils.getAnonymousUsername(signedUserId)
    const anonymousUser = await User.findOne({
        where: {
            username: anonymousUsername
        },
        attributes: ['user_id'],
        raw: true
    });
    if(anonymousUser){
      return anonymousUser.user_id
    }
}
