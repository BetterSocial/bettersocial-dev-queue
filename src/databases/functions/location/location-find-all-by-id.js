/**
 * 
 * @param {Model} model 
 * @param {string[]} topicIds 
 */
module.exports = async (model, locationIds = [], transaction, raw = true) => {
    if(locationIds.length === 0) return [];
    let returnTopic = await model.findAll({
        where: {
            location_id: locationIds
        },
        raw: true
    }, { transaction });
    
    return returnTopic;
}