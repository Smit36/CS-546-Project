const { getCollection } = require("./mongoConnection");

const APPROVAL_COLLECTION_NAME = "approvals";

module.exports = {
  approvals: () => getCollection(APPROVAL_COLLECTION_NAME),
};
