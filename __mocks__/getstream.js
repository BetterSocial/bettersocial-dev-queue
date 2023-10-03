const mockFeed = {
  addActivity: jest.fn(),
  removeActivity: jest.fn(),
  unfollow: jest.fn(),
  following: jest.fn(),
  followers: jest.fn(),
  get: jest.fn()
};

const mockClient = {
  reactions: {
    delete: jest.fn()
  },
  feed: jest.fn(() => mockFeed),
  followMany: jest.fn(),
  getActivities: jest.fn()
};

const mock = {
  connect: jest.fn(() => mockClient)
};

module.exports = mock;
