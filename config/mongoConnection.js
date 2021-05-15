const { MongoClient } = require("mongodb");
const { mongoConfig } = require("./settings");

const { serverUrl: databaseUrl, database: databaseName } = mongoConfig;
const connectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const client = new MongoClient(databaseUrl, connectOptions);

const connect = async (name = databaseName) => {
  if (!client.isConnected()) await client.connect();
  return client.db(name);
};

const disconnect = async (name = databaseName) =>
  client.isConnected() && (await client.close());

const getCollection = async (collectionName) => {
  const db = await connect();
  return db.collection(collectionName);
};

module.exports = {
  client,
  connect,
  disconnect,
  getCollection,
};
