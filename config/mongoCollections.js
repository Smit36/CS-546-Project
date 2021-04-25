const { getCollection } = require("./mongoConnection");

const CORPORATES_COLLECTION_NAME = "corporates";

module.exports = {
  corporate: () => getCollection(CORPORATES_COLLECTION_NAME)
};