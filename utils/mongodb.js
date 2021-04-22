const { ObjectId } = require("mongodb");

const idQuery = (id) => ({
  _id:
    id instanceof ObjectId
      ? id
      : typeof id === "string"
      ? new ObjectId(id)
      : id,
});

const isObjectIdString = (id) => ObjectId.isValid(id);

const stringifyObjectId = (objectId) => {
  if (objectId instanceof ObjectId) {
    return objectId.toHexString();
  } else {
    throw "Identifier is not an ObjectId";
  }
};

const parseMongoData = (data) =>
  !!data
    ? {
        ...data,
        _id: stringifyObjectId(data._id),
      }
    : null;

module.exports = {
  idQuery,
  isObjectIdString,
  stringifyObjectId,
  parseMongoData,
};
