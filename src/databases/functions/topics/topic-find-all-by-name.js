/**
 *
 * @param {Model} model
 * @param {string[]} topicIds
 */
module.exports = async (
  model,
  topicNames = [],
  transaction = null,
  raw = true
) => {
  if (topicNames.length === 0) return [];
  let returnTopic = await model.findAll({
    where: {
      name: topicNames,
    },
    raw,
  });

  return returnTopic;
};
