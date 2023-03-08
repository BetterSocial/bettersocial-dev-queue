const { v4: uuidv4 } = require("uuid")
const moment = require("moment");
const crypto = require("crypto");
const { Transaction } = require("sequelize");

/**
 * 
 * @param {Model} model 
 * @param {String} userId
 * @param {Transaction} transaction
 */
module.exports = async (model, userId, transaction = null) => {
    const salt = process.env.BETTER_HASH_SALT;
    let myTs = moment.utc().format("YYYY-MM-DD HH:mm:ss");

    const saltedUserId = salt + userId + salt;
    
    const anonymousUsername = crypto.createHash('sha256').update(saltedUserId).digest('hex');
    const userIdAnonymous = uuidv4()
    const user = await model.create(
        {
            user_id: userIdAnonymous,
            human_id: userIdAnonymous,
            country_code: '',
            username: anonymousUsername,
            real_name: '',
            profile_pic_path: '',
            profile_pic_asset_id: '',
            profile_pic_public_id: '',
            created_at: myTs,
            updated_at: myTs,
            last_active_at: myTs,
            status: "Y",
            is_anonymous: true
        },
        { transaction, returning: true}
    );
    
    return user;
}