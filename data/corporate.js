const { ObjectId } = require("mongodb");
const {
  corporates: getCorporatesCollection,
} = require("../config/mongoCollections");

const { QueryError } = require("../utils/errors");
const { idQuery, parseMongoData } = require("../utils/mongodb");
const {
  assertObjectIdString,
  assertIsValuedString,
  assertRequiredObject,
  assertRequiredNumber,
  assertContactString,
  assertEmailString,
} = require("../utils/assertion");

const isDataExist = (id, data, desc = "data") => {
  if (!data)
    throw new QueryError(`Cannot find corporate data with ID: ${id}`, 404);
};
const isDataExistByEmail = (email, data, desc = "data") => {
  if (data)
    throw new QueryError(
      `Corporate data already Exist with Email: ${email}`,
      409
    );
};

const getByObjectId = async (objectId) => {
  const collection = await getCorporatesCollection();
  const corporate = await collection.findOne(idQuery(objectId));
  isDataExist(objectId, corporate, "corporate");

  return parseMongoData(corporate);
};

const getByEmail = async (email) => {
  const collection = await getCorporatesCollection();
  const corporate = await collection.findOne({ emailDomain: email });
  isDataExistByEmail(email, corporate, "corporate");

  return false;
};

// Get All Corporate
const getAllCorporates = async () => {
  const collection = await getCorporatesCollection();

  const corporateList = await collection.find({}).toArray();

  return parseMongoData(corporateList);
};

// Get Corporate By Id
const getCorporate = async (id) => {
  assertObjectIdString(id);
  return await getByObjectId(new ObjectId(id));
};

// Get Corporate By Email
const getCorporateByEmail = async (email) => {
  assertEmailString(email);
  return await getByEmail(email);
};

// Create New Corporate
const createCorporate = async (data) => {
  assertRequiredObject(data);

  const {
    name,
    emailDomain,
    contactNo,
    address,
    createdBy,
    updatedBy,
    createdAt = new Date().getTime(),
  } = data;

  assertIsValuedString(name, "Corporate name");
  assertIsValuedString(emailDomain, "Email");
  assertEmailString(emailDomain, "Email");
  assertIsValuedString(contactNo, "Contact Number");
  assertContactString(contactNo, "Contact Number");
  assertIsValuedString(address, "Address");
  assertRequiredObject(createdBy, "Created By");
  assertRequiredObject(updatedBy, "Update By");
  assertRequiredNumber(createdAt, "Corporate created time");

  const corporateData = {
    _id: new ObjectId(),
    name: name,
    emailDomain: emailDomain,
    contactNo: contactNo,
    address: address,
    createdBy: createdBy,
    updatedBy: updatedBy,
    createdAt: createdAt,
    updatedAt: createdAt,
  };

  const collection = await getCorporatesCollection();
  const { result, insertedCount, insertedId } = await collection.insertOne(
    corporateData
  );

  if (!result.ok || insertedCount !== 1) {
    throw new QueryError(
      `Could not create corporate for corporate Email(${email})`
    );
  }

  return await getByObjectId(insertedId);
};

// Update Corporate
const updateCorporate = async (id, updates) => {
  assertObjectIdString(id);
  assertRequiredObject(updates, "Corporate updates data");

  const {
    name,
    emailDomain,
    contactNo,
    address,
    updatedBy,
    updatedAt = new Date().getTime(),
  } = updates;

  assertIsValuedString(name, "Corporate name");
  assertIsValuedString(emailDomain, "Email");
  assertEmailString(emailDomain, "Email");
  assertIsValuedString(contactNo, "Contact Number");
  assertContactString(contactNo, "Contact Number");
  assertIsValuedString(address, "Address");
  assertRequiredObject(updatedBy, "Update By");
  assertRequiredNumber(updatedAt, "Corporate updated time");

  const corporate = await getCorporate(id);

  if (!corporate) {
    throw new QueryError(`Corporate with ID\`${id}\` not found.`);
  }

  const options = { returnOriginal: false };
  const collection = await getCorporatesCollection();

  const newUpdate = {
    name: name,
    emailDomain: emailDomain,
    contactNo: contactNo,
    address: address,
    updatedBy: updatedBy,
    updatedAt: updatedAt,
  };
  const ops = {
    $set: newUpdate,
  };

  const { value: updatedCorporate, ok } = await collection.findOneAndUpdate(
    idQuery(id),
    ops,
    options
  );

  if (!ok) {
    throw new QueryError(`Could not update corporate with ID \`${id}\``);
  }

  return parseMongoData(updatedCorporate);
};

// Delete Corporate
const deleteCorporate = async (id) => {
  assertObjectIdString(id);
  const collection = await getCorporatesCollection();

  const corporate = await getCorporate(id);
  if (!corporate) {
    throw new QueryError(`Corporate with ID\`${id}\` not found.`);
  }
  const deletionInfo = await collection.deleteOne({ _id: new ObjectId(id) });

  if (deletionInfo.deletedCount === 0) {
    throw new QueryError(`Could not delete corporate with id of ${id}`);
  }

  if (deletionInfo.deletedCount > 0) {
    return true;
  } else {
    return false;
  }
};

module.exports = {
  createCorporate,
  getCorporate,
  getAllCorporates,
  updateCorporate,
  deleteCorporate,
  getCorporateByEmail,
};
