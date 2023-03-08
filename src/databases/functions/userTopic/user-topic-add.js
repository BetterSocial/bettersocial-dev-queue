const { v4: uuidv4 } = require("uuid")
const moment = require("moment");

/**
 * 
 * @param {Model} model 
 * @param {RegisterBodyData.Users} users 
 */
module.exports = async (userTopicModel, userTopicHistoryModel, userId, topics = [], transaction = null) => {
    if(topics.length === 0) return;
    let myTs = moment.utc().format("YYYY-MM-DD HH:mm:ss");
    let topics_array_return = topics.map((val) => {
        return {
            user_topics_id: uuidv4(),
            user_id: userId,
            topic_id: val,
            created_at: myTs,
            updated_at: myTs,
        };
    });

    let returnTopic = await userTopicModel.bulkCreate(topics_array_return, {
        transaction,
        returning: true,
        raw: true,
    });

    if (returnTopic.length > 0) {
        let topic_return = returnTopic.map((val) => {
            return {
                user_id: val.user_id,
                topic_id: val.topic_id,
                action: "in",
                created_at: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
            };
        });
        await userTopicHistoryModel.bulkCreate(topic_return, {
            transaction,
        });
    }

    return returnTopic;
}