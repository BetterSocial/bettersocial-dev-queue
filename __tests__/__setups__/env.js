require('dotenv').config();

Object.assign(process.env, {
  NODE_ENV: 'test',
  MONGODB_DBNAME: 'testing',
  DB_NAME: 'testing',
  SEARCHBOX_SSL_URL: 'http://localhost:9200',
  REDIS_ENTERPRISE_URL: 'redis://localhost:6379/0',
  REDIS_TLS_URL: 'redis://localhost:6379/0',
  API_KEY: '',
  APP_ID: '',
  SECRET: ''
});
