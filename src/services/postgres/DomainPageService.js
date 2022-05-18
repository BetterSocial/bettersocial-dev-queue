const { Pool, Client } = require('pg');
const { v4: uuidv4 } = require("uuid");

class DomainPageService {
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

  async addDomain({domain_name, logo, short_description}) {
    const domain_page_id = uuidv4();
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO domain_page VALUES($1, $2, $3, $4, $5, $6) RETURNING domain_page_id',
      values: [
        domain_page_id,
        domain_name,
        logo,
        short_description,
        createdAt,
        createdAt
      ]
    }

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return null;
    }
    return result.rows[0].domain_page_id;
  }

  async getDomainById(domainId) {
    const query = {
      text: 'SELECT *  FROM domain_page WHERE id = $1',
      values: [domainId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new Error('domain not found');
    }

    return result.rows[0];
  }

  async getDomainByDomainName(domainName) {
    const query = {
      text: 'SELECT domain_page_id FROM domain_page WHERE domain_name = $1',
      values: [domainName],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      return null;
    }
    return result.rows[0];
  }
}

module.exports = DomainPageService;