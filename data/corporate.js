const { ObjectId, ObjectID } = require("mongodb");
const {
  corporate: getCorporatesCollection,
} = require("../config/mongoCollections");

const { QueryError, ValidationError } = require("../utils/errors");
const {
  idQuery,
  parseMongoData
} = require("../utils/mongodb");
const {
  assertObjectIdString,
  assertIsValuedString,
  assertRequiredObject,
  assertRequiredNumber,
} = require("../utils/assertion");

const getByObjectId = async (objectId) => {
    const collection = await getCorporatesCollection();
    const corporate = await collection.findOne(idQuery(objectId));
    return parseMongoData(corporate);
};

const getAllCorporates = async () => {
    const collection = await getCorporatesCollection();

    const corporateList = await collection.find({}).toArray();

    return parseMongoData(corporateList);
},
  
const getCorporate = async (id) => {
    assertObjectIdString(id);
    return await getByObjectId(new ObjectId(id));
};

const createCorporate = async (data) => {
    assertRequiredObject(data);
  
    const { name, email, contact, address, createdBy, updateBy, createdAt = new Date().getTime() } = data;
     
    assertIsValuedString(name, "Corporate name");
    assertIsValuedString(email, "Email");
    assertRequiredNumber(contact, "Contact Number");
    assertIsValuedString(address, "Address");
    assertIsValuedString(createdBy, "Created By");
    assertIsValuedString(updateBy, "Update By");
    assertRequiredNumber(createdAt, "Corporate created time");
  
    const corporateData = {
      _id: new ObjectId(),
      name : name,
      email: email,
      contact: contact,
      address: address,
      createdBy: createdBy,
      updateBy: updateBy,
      createdAt: createdAt,
      updatedAt: createdAt,
    };
  
    const collection = await getCorporatesCollection();
    const { result, insertedCount, insertedId } = await collection.insertOne(
      corporateData
    );
  
    if (!result.ok || insertedCount !== 1) {
      throw new QueryError(`Could not create corporate for corporate Email(${email})`);
    }
  
    return await getByObjectId(insertedId);
};

const updateCorporate = async (id, updates) => {
    assertRequiredObject(updates, "Corporate updates data");

    const { name, email, contact, address, createdBy, updateBy, createdAt = new Date().getTime() } = data;
    
    assertIsValuedString(name, "Corporate name");
    assertIsValuedString(email, "Email");
    assertRequiredNumber(contact, "Contact Number");
    assertIsValuedString(address, "Address");
    assertIsValuedString(createdBy, "Created By");
    assertIsValuedString(updateBy, "Update By");
    assertRequiredNumber(createdAt, "Corporate created time");
  
    const corporate = await getCorporate(id);

    if (!corporate) {
      throw new QueryError(`Corporate with ID\`${id}\` not found.`);
    }

    // TODO: validate session user ID and operation
  
    const options = { returnOriginal: false };
    const collection = await getCorporatesCollection();
    const currentTimestamp = new Date().getTime();
    
    const newUpdate = {
      _id: new ObjectId(),
      name : name,
      email: email,
      contact: contact,
      address: address,
      createdBy: createdBy,
      updateBy: updateBy,
      createdAt: createdAt,
      updatedAt: currentTimestamp,
    };

    const ops = {
      $set: newUpdate      
    };
  
    const { value: updatedCorporate, ok } = await collection.findOneAndUpdate(
      idQuery(id),
      ops,
      options
    );
  
    if (!ok) {
      throw new QueryError(`Could not update rank with ID \`${id}\``);
    }
  
    return parseMongoData(updatedCorporate);
};

const deleteCorporate = async (id) => {
    const collection = await getCorporatesCollection();  
    
    const corporate = await getCorporate(id);

    const deletionInfo = await collection.deleteOne({ _id: idQuery(id) });

    if (deletionInfo.deletedCount === 0) {
        throw new QueryError(`Could not delete corporate with id of ${id}`);
    }

    if (deletionInfo.deletedCount > 0) {
        return true;
    }
    else {
        return false;
    }
};

module.exports = {
    createCorporate,
    getCorporate,
    getAllCorporates,
    updateCorporate,
    deleteCorporate
};