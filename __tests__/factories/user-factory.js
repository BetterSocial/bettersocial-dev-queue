const {faker} = require('@faker-js/faker');
const {v4: uuidV4} = require('uuid');
const {User} = require('../../src/databases/models');
const ModelFactory = require('./model-factory');

const UserFactory = new ModelFactory(User, {
  default() {
    return {
      username: faker.internet.userName(),
      user_id: uuidV4(),
      human_id: uuidV4(),
      country_code: faker.location.countryCode('alpha-3'),
      last_active_at: new Date(),
      status: 'Y'
    };
  },
  admin() {
    return {
      user_id: 'admin',
      username: process.env.USERNAME_ADMIN
    };
  }
});

module.exports = UserFactory;
