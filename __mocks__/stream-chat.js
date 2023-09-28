const mockChannel = {
  create: jest.fn(),
  addMembers: jest.fn()
};

const mockStreamChatInstance = {
  createToken: jest.fn(),
  channel: jest.fn(() => mockChannel)
};

module.exports = {
  StreamChat: {
    getInstance: jest.fn(() => mockStreamChatInstance)
  }
};
