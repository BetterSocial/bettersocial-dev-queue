module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      skipMD5: true
    },
    autoStart: false,
    instance: {
      dbName: 'testing'
    }
  },
  mongoURLEnvName: 'MONGODB_URL'
};
