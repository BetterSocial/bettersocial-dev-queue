/**
 *
 * @param {Model} model
 * @param {string[]} topicIds
 */
module.exports = async (
  model,
  topicIds = [],
  transaction = null,
  raw = true
) => {
  if (topicIds.length === 0) return [];
  let returnTopic = await model.findAll({
    where: {
      topic_id: topicIds,
    },
    raw,
  });

  return returnTopic;
};
