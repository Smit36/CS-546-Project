const { ObjectId, ObjectID } = require("mongodb");
const {
  ranks: getRankCollection,
} = require("../config/mongoCollections");

const { QueryError, ValidationError } = require("../utils/errors");
const {
  idQuery,
  parseMongoData,
  stringifyObjectId,
} = require("../utils/mongodb");
const {
  assertObjectIdString,
  assertIsValuedString,
  assertRequiredObject,
  assertRequiredNumber,
} = require("../utils/assertion");

const getByObjectId = async (objectId) => {
    const collection = await getRankCollection();
    const rank = await collection.findOne(idQuery(objectId));
    return parseMongoData(rank);
  };
  
  const getRank = async (id) => {
    assertObjectIdString(id);
    return await getByObjectId(new ObjectId(id));
  };

  const createRank = async (data) => {
    assertRequiredObject(data);
  
    const { corporateId, name, level, createdAt = new Date().getTime() } = data;
  
    assertObjectIdString(corporateId, "Corporate ID");
    assertIsValuedString(name, "Rank name");
    assertRequiredNumber(level, "Rank in corporate hierarchy");
    assertRequiredNumber(createdAt, "Arroval/trip created time");
  
    const rankData = {
      _id: new ObjectId(),
      corporateId: new ObjectId(corporateId),
      name : name,
      level: level,
      createdAt: createdAt,
      updatedAt: createdAt,
    };
  
    const collection = await getRankCollection();
    const { result, insertedCount, insertedId } = await collection.insertOne(
      rankData
    );
  
    if (!result.ok || insertedCount !== 1) {
      throw new QueryError(`Could not create rank for corporate ID(${corporateId})`);
    }
  
    return await getByObjectId(insertedId);
  };
  

  module.exports = {
    createRank,
    getRank,
  };