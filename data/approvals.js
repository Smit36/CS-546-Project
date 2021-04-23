const { ObjectId, ObjectID } = require("mongodb");
const {
  approvals: getApprovalCollection,
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
} = require("../utils/assertion");
const { getTripById } = require("./trips");

const APPROVAL_STATUS = {
  CREATED: "CREATED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PENDING: "PENDING",
};

const isApprovalStatus = (s) => s in Object.values(APPROVAL_STATUS);

const getByObjectId = async (objectId) => {
  const collection = await getApprovalCollection();
  const approval = await collection.findOne(idQuery(objectId));
  return parseMongoData(approval);
};

const getApproval = async (id) => {
  assertObjectIdString(id);
  return await getByObjectId(new ObjectId(id));
};

const getTripApproval = async (tripId) => {
  assertObjectIdString(tripId);

  // TODO: trip data function
  // const trip = await getTripById(tripId);
  // return await getApprovalById(trip.approvalId);
  return null;
};

const createApproval = async (data) => {
  assertRequiredObject(data);

  const { tripId, userId, createdAt = new Date().getTime() } = data;

  assertObjectIdString(tripId, "Approval trip ID");
  assertObjectIdString(userId, "Approval creator's user ID");
  assertRequiredNumber(createdAt, "Arroval/trip created time");

  const initStatus = APPROVAL_STATUS.CREATED;
  const approvalData = {
    _id: new ObjectId(),
    status: initStatus,
    updates: [
      {
        _id: new ObjectId(),
        userId: new ObjectId(userId),
        status: initStatus,
        message: "",
        createdAt: createdAt,
      },
    ],
    createdAt: createdAt,
    updatedAt: createAt,
  };

  const { result, insertedCount, insertedId } = await collection.insertOne(
    approvalData
  );

  if (!result.ok || insertedCount !== 1) {
    throw new QueryError(`Could not create approval for trip ID(${tripId})`);
  }

  return await getByObjectId(insertedId);
};

const optionalValuedString = (s, description) =>
  s !== undefined && assertIsValuedString(s, description);

const updateApproval = async (id, updates) => {
  assertObjectIdString(id);
  assertRequiredObject(updates, "Approval updates data");

  const { lastUpdateId, userId, status, message } = updates;
  assertObjectIdString(lastUpdateId, "Last approval update ID");
  assertObjectIdString(userId, "Approval updated-by-user ID");
  assertIsValuedString(status, "Approval status");
  optionalValuedString(status, "Approval message");

  if (!isApprovalStatus(status)) {
    throw new ValidationError("Approval status is invalid");
  }

  const approval = await getApprovalById(id);
  if (
    !approval ||
    !Array.isArray(approval.updates) ||
    approval.updates.length === 0
  ) {
    throw new QueryError(`Approval thread with ID\`${id}\` is invalid.`);
  }

  const lastUpdate = approval.updates[approval.updates.length - 1];
  if (lastUpdaateId !== stringifyObjectId(lastUpdate._id)) {
    throw new QueryError(`Approval thread request is out-of-date.`);
  }

  // TODO: validate session user ID and operation

  const options = { returnOriginal: false };
  const collection = await getApprovalCollection();
  const currentTimestamp = new Date().getTime();
  const newUpdate = {
    _id: new ObjectId(),
    userId: new ObjectId(userId),
    status: status,
    message: message || "",
    createdAt: currentTimestamp,
  };
  const ops = {
    $set: {
      status: status,
      updatedAt: currentTimestamp,
      updatedBy: new ObjectId(userId),
    },
    $push: {
      updates: newUpdate,
    },
  };

  const { value: updatedApproval, ok } = await collection.findOneAndUpdate(
    idQuery(id),
    ops,
    options
  );

  if (!ok) {
    throw new QueryError(`Could not update approval thread with ID \`${id}\``);
  }

  return updatedApproval;
};

const updateTripApproval = (tripId, updates) => {
  assertObjectIdString(tripId);

  // TODO: trip data function
  // const trip = await getTripById(tripId);
  // return await updateApproval(trip.approvalId);
  return null;
};

module.exports = {
  getApproval,
  getTripApproval,
  updateApproval,
  updateTripApproval,
};
