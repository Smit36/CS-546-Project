const { getCollection } = require("./mongoConnection");

const RANK_COLLECTION_NAME = "ranks";

module.exports = {
  ranks: () => getCollection(RANK_COLLECTION_NAME)
};
