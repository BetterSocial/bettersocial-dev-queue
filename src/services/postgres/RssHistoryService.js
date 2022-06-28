const { v4: uuidv4 } = require("uuid");
const client = require("./pool");

const addRssHistory = async ({ domain_name, link }) => {
  const createdAt = new Date().toISOString();
  const id = uuidv4();
  const query = {
    text: "INSERT INTO rss_history VALUES($1, $2, $3, $4, $5)",
    values: [id, domain_name, link, createdAt, createdAt],
  };
  const result = await client.query(query);
  return result.rows;
};

module.exports = {
  addRssHistory,
};
