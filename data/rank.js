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
const {
  USER_ROLE
} = require('../utils/constants');

const getByObjectId = async (objectId) => {
    const collection = await getRankCollection();
    const rank = await collection.findOne(idQuery(objectId));
    return parseMongoData(rank);
  };
  
const getRank = async (id) => {
    assertObjectIdString(id);
    return await getByObjectId(new ObjectId(id));
};

const getAllRanks = async (user) => {
    assertRequiredObject(user);

    const collection = await getRankCollection();

    if (user.role === USER_ROLE.CORPORATE) {
      const rankList = await collection.find({ corporateId : new ObjectId(user.corporateId) }).toArray();
      return parseMongoData(rankList);
    }

    const rankList = await collection.find({}).toArray();

    return parseMongoData(rankList);
};

const createRank = async (data, corporateId) => {
    assertRequiredObject(data);
  
    const { name, level, createdAt = new Date().getTime() } = data;

    assertObjectIdString(corporateId, "Corporate ID");
    assertIsValuedString(name, "Rank name");
    assertRequiredNumber(parseInt(level), "Rank level");
    assertRequiredNumber(createdAt, "Rank created time");
  
    const rankData = {
      _id: new ObjectId(),
      corporateId: new ObjectId(corporateId),
      name : name,
      level: parseInt(level),
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

const updateRank = async (id, updates) => {
    assertObjectIdString(id);
    assertRequiredObject(updates, "Ranks updates data");
  
    const { corporateId, name, level } = updates;
    assertObjectIdString(corporateId, "Updated Corporate ID");
    assertIsValuedString(name, "Updated rank name");
    assertRequiredNumber(level, "Updated rank level");
  
    const rank = await getRank(id);

    if (!rank) {
      throw new QueryError(`Rank with ID\`${id}\` not found.`);
    }

    // TODO: validate session user ID and operation
  
    const options = { returnOriginal: false };
    const collection = await getRankCollection();
    const currentTimestamp = new Date().getTime();

    const newUpdate = {
      corporateId: new ObjectId(corporateId),
      name: name,
      level: level,
      updatedAt: currentTimestamp,
    };

    const ops = {
      $set: newUpdate      
    };
  
    const { value: updatedRank, ok } = await collection.findOneAndUpdate(
      idQuery(id),
      ops,
      options
    );
  
    if (!ok) {
      throw new QueryError(`Could not update rank with ID \`${id}\``);
    }
  
    return parseMongoData(updatedRank);
};  

module.exports = {
    createRank,
    getRank,
    getAllRanks,
    updateRank
};