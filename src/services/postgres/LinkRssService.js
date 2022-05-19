const { Pool, Client } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const { v4: uuidv4 } = require("uuid");
const { dateCreted } = require('../../utils/custom');

class LinkRssService {
  constructor() {
    const config = {
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    };

    this._pool = new Client({
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
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