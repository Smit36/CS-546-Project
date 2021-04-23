const { getCollection } = require("./mongoConnection");

const RANK_COLLECTION_NAME = "ranks";
const USER_COLLECTION_NAME = "users";

module.exports = {
  ranks: () => getCollection(RANK_COLLECTION_NAME),
  users: () => getCollection(USER_COLLECTION_NAME)
};
