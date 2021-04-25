const { getCollection } = require("./mongoConnection");

// const EXAMPLE_COLLECTION_NAME = "books";
const TRIPS_COLLECTION_NAME = "trips";

module.exports = {
  // example: () => getCollection(EXAMPLE_COLLECTION_NAME)
  trips: () => getCollection(TRIPS_COLLECTION_NAME),
};
