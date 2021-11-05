const app = require('./app');
require('dotenv').config();

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(process.env.REDIS_URL);
  console.info(`bettersocial-dev-queue running in ${process.env.PORT}`);
});

let server;

const exitHandler = () => {
  if (server) {
    server.close(() => {
      // eslint-disable-next-line no-console
      console.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
