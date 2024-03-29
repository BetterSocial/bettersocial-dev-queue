const { v4: uuidv4 } = require("uuid");
const client = require("./pool");

const addNewsLink = async ({
  news_url,
  domain_page_id,
  site_name,
  title,
  image,
  description,
  url,
  keyword,
  author,
  url_compact,
  created_article,
  priority,
}) => {
  console.log("current millis", created_article);
  const news_link_id = uuidv4();
  const createdAt = new Date(created_article).toISOString();
  const updatedAt = new Date().toISOString();
  let postId = null;
  const query = {
    text: "INSERT INTO news_link VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING news_link_id",
    values: [
      news_link_id,
      news_url,
      domain_page_id,
      site_name,
      title,
      image,
      description,
      url,
      keyword,
      author,
      createdAt,
      updatedAt,
      url_compact,
      postId,
      created_article,
      priority,
    ],
  };

  const result = await client.query(query);

  if (!result.rowCount) {
    return null;
  }
  return result.rows[0].news_link_id;
};

const getAllNewsLinks = async () => {
  const query = {
    text: "SELECT * FROM news_link ",
    values: [],
  };

  try {
    let result = await client.query(query);
    return result.rows;
  } catch (error) {
    return [];
  }
};

const isExsistNewsLink = async (link) => {
  const query = {
    text: "SELECT news_link_id FROM news_link WHERE  news_url = $1 limit 1",
    values: [link],
  };

  return await client.query(query);
};

const validationLink = async () => {
  let links = `"https://www.dailymail.co.uk/news/live/article-10808499/Rebekah-Vardy-vs-Coleen-Rooney-Wagatha-Christie-trial-latest-news-updates.html",
    "https://www.dailymail.co.uk/news/article-10810187/Grim-photos-heartbreaking-devastation-California-wildfire.html",
    "https://www.dailymail.co.uk/news/article-10809957/Wagatha-Christie-trial-HALTED-Rebekah-Vardy-breaks-tears-AGAIN.html"`;
  const query = {
    text: "SELECT * FROM news_link WHERE  news_url in ($1)",
    values: [links],
  };

  try {
    const result = await client.query(query);
    // if (!result.rows.length) {
    //   console.log('link tidak ada');
    //   return false;
    // }
    // console.log('link ada');
    return result.rows;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = {
  validationLink,
  isExsistNewsLink,
  getAllNewsLinks,
  addNewsLink,
};
