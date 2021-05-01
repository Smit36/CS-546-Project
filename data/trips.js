const { ObjectId } = require("mongodb");
const { trips: getTripCollection } = require("../config/mongoCollections");

const { QueryError } = require("../utils/errors");
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
  assertNonEmptyArray,
} = require("../utils/assertion");
const { createApproval } = require("./approvals");

const getByObjectId = async (objectId) => {
  const collection = await getTripCollection();
  const trip = await collection.findOne(idQuery(objectId));
  return parseMongoData(trip);
};

const getTrip = async (id) => {
  assertObjectIdString(id);
  return await getByObjectId(new ObjectId(id));
};

const getUserTrips = async (userId) => {
  assertObjectIdString(userId);
  const collection = await getTripCollection();
  const trips = await collection
    .find({ userId: new ObjectId(userId) })
    .toArray();
  return parseMongoData(trips);
};

const assertTripData = (data) => {
  assertRequiredObject(data);

  const {
    userId,
    corporateId,
    managerId,
    employeeIdList,
    name,
    description,
    startTime,
    endTime,
    createdAt = new Date().getTime(),
  } = data;

  assertObjectIdString(userId, "Trip creater ID");
  assertObjectIdString(corporateId, "Trip corporate ID");
  assertObjectIdString(managerId, "Trip manager's user ID");
  assertNonEmptyArray(employeeIdList, "Trip employee ID list");
  assertIsValuedString(name, "Trip name");
  assertIsValuedString(description, "Trip description");
  assertRequiredNumber(startTime, "Trip start time");
  assertRequiredNumber(endTime, "Trip end time");
  assertRequiredNumber(createdAt, "Trip data creation time");

  employeeIdList.forEach((userId) =>
    assertObjectIdString(userId, "Employee ID")
  );
};

const createTrip = async (data) => {
  assertTripData(data);

  const {
    userId,
    corporateId,
    managerId,
    employeeIdList,
    createdAt = new Date().getTime(),
  } = data;

  const tripId = new ObjectId();

  const approval = await createApproval({
    tripId: stringifyObjectId(tripId),
    userId,
    createdAt,
  });

  const tripData = {
    _id: tripId,
    corporateId: new ObjectId(corporateId),
    approvalId: new ObjectId(approval._id),
    managerId: new ObjectId(managerId),
    employeeIdList: [managerId, ...employeeIdList].map(
      (ids) => new ObjectId(ids)
    ),
    expenseIdList: [],
    createdAt: createdAt,
    updatedAt: createdAt,
    createdBy: userId,
    updatedBy: userId,
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

const deleteTrip = async (id) => {
  assertObjectIdString(id);

  const collection = await getTripCollection();
  const { value: deletedTrip, ok } = await collection.findOneAndDelete(
    idQuery(id)
  );

  if (!ok || !deletedTrip) {
    throw new QueryError(`Could not delete trip with ID of ${id}`);
  }

  return parseMongoData(deletedTrip);
};

const getAddTripExpensesOps = (expenseIdList) => ({
  $addToSet: {
    expenseIdList: {
      $each: expenseIdList,
    },
  },
});

const getRemoveTripExpensesOps = (expenseIdList) => ({
  $pull: {
    expenseIdList: {
      $in: expenseIdList,
    },
  },
});

const updateTripExpenses = async (
  tripId,
  userId,
  expenseIdList,
  getUpdateOps
) => {
  assertObjectIdString(tripId, "Trip ID");
  assertObjectIdString(userId, "Trip updater user ID");
  assertNonEmptyArray(expenseIdList);

  expenseIdList.forEach((expenseId) =>
    assertObjectIdString(expenseId, "Expense ID")
  );

  const currentTimestamp = new Date().getTime();
  const ops = {
    $set: {
      updatedAt: currentTimestamp,
      updatedBy: new ObjectId(userId),
    },
    ...getUpdateOps(expenseIdList),
  };
  const options = { returnOriginal: false };

  const collection = await getTripCollection();
  const { value: updatedTrip, ok } = await collection.findOneAndUpdate(
    idQuery(tripId),
    ops,
    options
  );

  if (!ok || !updatedTrip) {
    throw new QueryError(`Could not update expenses for trip \`${tripId}\``);
  }

  return parseMongoData(updatedTrip);
};

const addTripExpenses = (...params) =>
  updateTripExpenses(...params, getAddTripExpensesOps);
const removeTripExpenses = (...params) =>
  updateTripExpenses(...params, getRemoveTripExpensesOps);

module.exports = {
  createTrip,
  assertTripData,
  getTrip,
  getUserTrips,
  deleteTrip,
  addTripExpenses,
  removeTripExpenses,
};
