const { getCollection } = require("./mongoConnection");

const APPROVAL_COLLECTION_NAME = "approvals";
const CORPORATE_COLLECTION_NAME = "corporates";

module.exports = {
  approvals: () => getCollection(APPROVAL_COLLECTION_NAME),
  corporates: () => getCollection(CORPORATE_COLLECTION_NAME),
};
