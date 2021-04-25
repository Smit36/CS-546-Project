const { ObjectId } = require("mongodb");
const {
  trips: getTripCollection,
} = require("../config/mongoCollections");

const { QueryError, ValidationError } = require("../utils/errors");
const {
  idQuery,
  parseMongoData,
} = require("../utils/mongodb");
const {
  assertObjectIdString,
  assertIsValuedString,
  assertRequiredObject,
  assertRequiredNumber,
} = require("../utils/assertion");
// const { createApproval } = require("./approvals");
// const { getUser } = require("./users");

const getByObjectId = async (objectId) => {
  const collection = await getTripCollection();
  const trip = await collection.findOne(idQuery(objectId));
  return parseMongoData(trip);
};

const getTrip = async (id) => {
  assertObjectIdString(id);
  return await getByObjectId(new ObjectId(id));
};

const isUserFromCorporate = async (userId, corporateId) => {
  // TODO
  // const user = await getUser(userId);
  // return user.corporateId === corporateId;
  return true;
};

const createTrip = async (data) => {
  assertRequiredObject(data);

  const { corporateId, managerId, employeeIdList = [], name, description, startTime, endTime, createdAt = new Date().getTime() } = data;

  assertObjectIdString(corporateId, "Trip corporate ID");
  assertObjectIdString(managerId, "Trip manager's user ID");
  assertNonEmptyArray(employeeIdList, "Trip employee ID list")
  assertIsValuedString(name, "Trip name");
  assertIsValuedString(description, "Trip description");
  assertRequiredNumber(startTime, "Trip start time");
  assertRequiredNumber(endTime, "Trip end time");
  assertRequiredNumber(createdAt, "Trip data creation time");

  // TODO: validate user corporate
  const isManagerFromCorporate = await isUserFromCorporate(managerId, corporateId);
  if (!isManagerFromCorporate) {
    throw new ValidationError(`Invalid manager: User ${managerId} not in corporate`);
  }
  const outsiderIdList = await employeeIdList.reduce((idList, userId) => {
    if (await isUserFromCorporate(userId, corporateId)) {
      idList.push(userId);
    }
    return idList;
  }, []);
  if (outsiderIdList.length > 0) {
    throw new ValidationError(`Invalid employee(s): ${outsiderIdList.join(', ')} not in corporate`);
  }

  const tripId = new ObjectId();
  // TODO: create Approval
  // cnost approval = await createApproval({
  //   tripId,
  //   userId,
  //   createAt,
  // });

  const tripData = {
    _id: tripId,
    corporateId: new ObjectId(corporateId),
    // TODO: add approvalId
    // approvalId: new ObjectId(approval._id),
    managerId: new ObjectId(managerId),
    employeeIdList: employeeIdList.map(ids => new ObjectId(ids)),
    expenseIdList: [],
    createdAt: createdAt,
    updatedAt: createdAt,
    // TODO: get session user ID
    createdBy: null,
    updatedBy: null,
  };

  const collection = await getTripCollection();
  const { result, insertedCount, insertedId } = await collection.insertOne(
    tripData
  );

  if (!result.ok || insertedCount !== 1) {
    throw new QueryError(`Could not add trip data`);
  }

  return await getByObjectId(insertedId);
};

const deleteTrip = (id) => {
  assertObjectIdString(id);

  const collection = await getTripCollection();
  const { value: deleletedTrip, ok } = await collection.findOneAndDelete(
    idQuery(id)
  );

  if (!ok) {
    throw new QueryError(`Could not delete trip with ID of ${id}`);
  }

  return deleletedTrip;
};

// TODO
const addTripExpenses = (tripId, expenseData) => {
  // const expense = await createExpense({ tripId, expenseData });
  // const expenseId = expense._id;

  // const ops = {
  //   $addToSet: {
  //     expenseIdList: expenseId,
  //   },
  // };
  // const options = { returnOriginal: false };

  // const collection = await getTripCollection();
  // const { value: updatedTrip, ok } = await collection.findOneAndUpdate(
  //   idQuery(tripId),
  //   ops,
  //   options
  // );

  // if (!ok) {
  //   throw new QueryError(`Could not update expenses of trip with ID \`${tripId}\``);
  // }

  // return parseMongoData(updatedTrip);
  return null;
};


module.exports = {
  createTrip,
  getTrip,
  deleteTrip,
  addTripExpenses,
};
