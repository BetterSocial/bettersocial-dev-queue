const {faker} = require('@faker-js/faker');
const {v4: uuidV4} = require('uuid');
const {Topics} = require('../../src/databases/models');
const ModelFactory = require('./model-factory');
const {ICON_TOPIC_CHANNEL} = require('../../src/utils');

const TopicsFactory = new ModelFactory(Topics, {
  default() {
    return {
      topic_id: () => uuidV4(),
      name: () => faker.lorem.word(),
      icon_path: ICON_TOPIC_CHANNEL,
      categories: () => faker.lorem.word(),
      created_at: () => faker.date.past()
    };
  }
});

module.exports = TopicsFactory;
