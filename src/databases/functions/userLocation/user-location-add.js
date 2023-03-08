const moment = require("moment");

/**
 * 
 * @param {Model} model 
 * @param {String[]} locations
 */
module.exports = async (userLocationModel, userLocationHistoryModel, userId, locations = [], transaction = null) => {
    if(locations.length === 0) return;
    let myTs = moment.utc().format("YYYY-MM-DD HH:mm:ss");
    let local_community_array_return = locations?.map((val, index) => {
        return {
            user_id: userId,
            location_id: val,
            created_at: myTs,
            updated_at: myTs,
        };
    });

    let returnUserLocation = await userLocationModel.bulkCreate(
        local_community_array_return,
        { transaction, returning: true, raw: true }
    );

    let returnArray = []

    let user_location_return = returnUserLocation.map((val) => {
        returnArray.push(val?.dataValues)
        return {
            user_id: val.user_id,
            location_id: val.location_id,
            action: "in",
            created_at: myTs,
        };
    });
    await userLocationHistoryModel.bulkCreate(user_location_return, {
        transaction,
    });

    return returnArray;
}