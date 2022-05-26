const { v4: uuidv4 } = require("uuid");
const client = require('./pool');



const addLink = async ({ domain_name, link }) => {
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

    const result = await client.query(query);

    if (!result.rowCount) {
        // throw new InvariantError('Domain page gagal ditambahkan');
        return null;
    }
    return true;
}

const getAllRssLinks = async () => {
    const query = {
        text: 'select * from rss_links order by random() limit 1',
        values: []
    }

    const result = await client.query(query);

    return result.rows[0];
}


module.exports = {
    addLink,
    getAllRssLinks
};