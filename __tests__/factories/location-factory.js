const {faker} = require('@faker-js/faker');
const {Locations} = require('../../src/databases/models');
const ModelFactory = require('./model-factory');

let incrementId = 0;
const getIncrementId = () => incrementId++;

const LocationFactory = new ModelFactory(Locations, {
  default() {
    return {
      location_id: () => getIncrementId(),
      location_level: faker.helpers.arrayElement(['Neighborhood', 'City', 'State', 'Country']),
      neighborhood: ({location_level}) =>
        location_level === 'Neighborhood' ? faker.location.street() : '',
      city: ({location_level}) =>
        ['Neighborhood', 'City'].includes(location_level) ? faker.location.city() : '',
      state: ({location_level}) =>
        ['Neighborhood', 'City', 'State'].includes(location_level) ? faker.location.state() : '',
      country: () => faker.location.country(),
      zip: () => faker.location.zipCode(),
      slug_name: ({neighborhood, city, state, country}) =>
        [neighborhood, city, state, country]
          .map((str) => str.replace(/ /g, '-'))
          .join('_')
          .toLowerCase(),
      status: 'Y'
    };
  }
});

module.exports = LocationFactory;
