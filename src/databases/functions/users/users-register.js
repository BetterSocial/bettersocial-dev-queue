const { v4: uuidv4 } = require("uuid")
const moment = require("moment");

/**
 * 
 * @param {Model} model 
 * @param {RegisterBodyData.Users} users 
 */
module.exports = async (model, users, transaction = null) => {
    let myTs = moment.utc().format("YYYY-MM-DD HH:mm:ss");
    const user = await model.create(
        {
            user_id: uuidv4(),
            human_id: users?.human_id,
            country_code: users?.country_code?.toUpperCase(),
            username: users?.username,
            real_name: users?.real_name,
            profile_pic_path: users?.profile_pic_path,
            profile_pic_asset_id: users?.cloudinary?.asset_id,
            profile_pic_public_id: users?.cloudinary?.public_id,
            created_at: myTs,
            updated_at: myTs,
            last_active_at: myTs,
            status: "Y",
        },
        { transaction, returning: true}
    );
    
    return user;
}