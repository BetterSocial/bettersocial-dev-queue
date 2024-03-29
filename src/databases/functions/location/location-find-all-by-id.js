/**
 *
 * @param {Model} model
 * @param {string[]} topicIds
 */
module.exports = async (
  model,
  locationIds = [],
  transaction = null,
  raw = true
) => {
  if (locationIds.length === 0) return [];
  let returnTopic = await model.findAll(
    {
      where: {
        location_id: locationIds,
      },
      raw,
    },
    { transaction }
  );

  return returnTopic;
};
