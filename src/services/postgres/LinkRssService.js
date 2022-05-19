const { Pool, Client } = require('pg');
const { v4: uuidv4 } = require("uuid");

class LinkRssService {
  constructor() {
    this._pool = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ?? 5432,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      },
      
    });
    this._pool.connect();
  }

  async addLink({domain_name, link}) {
    const domain_page_id = uuidv4();
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO rss_links VALUES($1, $2, $3, $4, $5)',
      values: [
        domain_page_id,
        domain_name,
        link,
        createdAt,
        createdAt
      ]
    }

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      // throw new InvariantError('Domain page gagal ditambahkan');
      return null;
    }
    return true;
  }

  async getAllRssLinks() {
    const query = {
      text: 'select * from rss_links order by random() limit 5',
      values: []
    }

    const result = await this._pool.query(query);

    return result.rows;
  }

}

module.exports = LinkRssService;