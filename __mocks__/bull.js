const mock = jest.fn().mockImplementation(() => {
  return {
    add: jest.fn(),
    process: jest.fn(),
    close: jest.fn(),
    on: jest.fn()
  };
});
module.exports = mock;
