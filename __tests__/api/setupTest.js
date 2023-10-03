const {sequelize} = require('../../src/databases/models');
const {phpArtisan} = require('../testutils');

beforeEach(async () => {
  await phpArtisan('migrate:fresh --seed');
});

afterAll(async () => {
  await sequelize.close();
});
