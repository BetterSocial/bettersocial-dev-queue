require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const mongodbConfig = {
  local: {
    database: process.env.MONGODB_DBNAME,
    url: process.env.MONGODB_URL,
  },
  development: {
    database: process.env.MONGODB_DBNAME,
    url: process.env.MONGODB_URL,
  },
  test: {
    database: process.env.MONGODB_DBNAME,
    url: process.env.MONGODB_URL,
  },
  production: {
    database: process.env.MONGODB_DBNAME,
    url: process.env.MONGODB_URL,
  },
};

const env = process.env.NODE_ENV || "development";
console.debug("env: " + env);
const config = mongodbConfig[env];
console.debug("config: " + config.url);
const client = new MongoClient(config.url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
let db;

const getDb = async () => {
  if (db) {
    //console.debug("mongodb already connected, just use it");
    return db;
  } else {
    console.debug("try to create mongodb connection");
    await client.connect();
    db = client.db(config.database);
    console.log('db connected')
    console.log(db)

    return db;
  }
}

const closeConn = async() => {
  if (client) {
    console.debug("Closing mongodb connection...");
    await client.close();
    console.debug("done closing mongodb connection.");
  }
}

module.exports = {
  getDb,
  closeConn,
}
