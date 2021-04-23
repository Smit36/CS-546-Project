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

  const result = { ...data };
  for (const [key, value] of Object.entries(data)) {
    result[key] =
      value instanceof ObjectId
        ? stringifyObjectId(value)
        : parseMongoData(value);
  }

  return result;
};

module.exports = {
  idQuery,
  isObjectIdString,
  stringifyObjectId,
  parseMongoData,
};
