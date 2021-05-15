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

const stringifyObjectId = (objectId, desc = 'Identifier') => {
  if (objectId instanceof ObjectId) {
    return objectId.toHexString();
  } else {
    throw `${desc} is not an ObjectId`;
  }
};

const parseMongoData = (data) => {
  if (data == null) {
    return null;
  }

  if (typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => parseMongoData(item));
  }

  if (data instanceof ObjectId) {
    return stringifyObjectId(data);
  }

  return Object.entries(data).reduce((result, [key, value]) => {
    result[key] = parseMongoData(value);
    return result;
  }, {});
};

module.exports = {
  idQuery,
  isObjectIdString,
  stringifyObjectId,
  parseMongoData,
};
