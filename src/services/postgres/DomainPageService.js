const { v4: uuidv4 } = require("uuid");
const client = require('./pool');

const getAllDomains = async () => {
    const query = {
        text: 'SELECT * FROM domain_page',
        values: [],
    };

    try {
        let result = await client.query(query);
        return result.rows;
    } catch (error) {
        console.log(error);
        return [];
    }
}

const getDomainByDomainName = async (domainName) => {
    const query = {
        text: 'SELECT domain_page_id FROM domain_page WHERE domain_name = $1',
        values: [domainName],
    };

    const result = await client.query(query);

    if (!result.rows.length) {
        return null;
    }
    return result.rows[0];
}

const addDomain = async ({ domain_name, logo, short_description }) => {
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

    const result = await client.query(query);

    if (!result.rowCount) {
        return null;
    }
    return result.rows[0].domain_page_id;
}

const getDomainById = async (domainId) => {
    const query = {
        text: 'SELECT *  FROM domain_page WHERE id = $1',
        values: [domainId],
    };

    const result = await client.query(query);

    if (!result.rows.length) {
        throw new NotFoundError('User tidak ditemukan');
    }

    return result.rows[0];
}

module.exports = {
    getAllDomains,
    getDomainByDomainName,
    addDomain,
    getDomainById
};