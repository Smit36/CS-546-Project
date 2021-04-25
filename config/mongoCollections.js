const { getCollection } = require("./mongoConnection");

const APPROVAL_COLLECTION_NAME = "approvals";
const CORPORATE_COLLECTION_NAME = "corporates";
const TRIP_COLLECTION_NAME = "trips";

module.exports = {
  approvals: () => getCollection(APPROVAL_COLLECTION_NAME),
  corporates: () => getCollection(CORPORATE_COLLECTION_NAME),
  trips: () => getCollection(TRIP_COLLECTION_NAME),
};
