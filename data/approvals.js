const { ObjectId } = require("mongodb");
const {
  approvals: getApprovalCollection,
} = require("../config/mongoCollections");

const { QueryError, ValidationError } = require("../utils/errors");
const { idQuery, parseMongoData } = require("../utils/mongodb");
const {
  assertObjectIdString,
  assertIsValuedString,
  assertRequiredObject,
  assertRequiredNumber,
} = require("../utils/assertion");

const APPROVAL_STATUS = {
  CREATED: "CREATED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PENDING: "PENDING",
};

const isApprovalStatus = (s = "") =>
  !s || Object.values(APPROVAL_STATUS).includes(s);

const getByObjectId = async (objectId) => {
  const collection = await getApprovalCollection();
  const approval = await collection.findOne(idQuery(objectId));
  return parseMongoData(approval);
};

const getApproval = async (id) => {
  assertObjectIdString(id);
  return await getByObjectId(new ObjectId(id));
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
    tripId: new ObjectId(tripId),
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
    updatedAt: createdAt,
  };

  const collection = await getApprovalCollection();
  const { result, insertedCount, insertedId } = await collection.insertOne(
    approvalData
  );

  if (!result.ok || insertedCount !== 1) {
    throw new QueryError(`Could not create approval for trip ID(${tripId})`);
  }

  return await getByObjectId(insertedId);
};

const optionalValuedString = (s, description) =>
  s == null || s === "" || assertIsValuedString(s, description);

const assertApprovalUpdates = (id, updates) => {
  assertObjectIdString(id);
  assertRequiredObject(updates, "Approval updates data");

  const { lastUpdateId, userId, status, message } = updates;
  assertObjectIdString(lastUpdateId, "Last approval update ID");
  assertObjectIdString(userId, "Approval updated-by-user ID");
  optionalValuedString(status, "Approval status");
  optionalValuedString(message, "Approval message");
  
  if (!status && !message) {
    throw new ValidationError("Approval updates requires at leaset a message or a new status.");
  }

  if (!isApprovalStatus(status)) {
    throw new ValidationError("Approval status is invalid");
  }
};

const updateApproval = async (id, updates) => {
  assertApprovalUpdates(id, updates);
  const { lastUpdateId, userId, message } = updates;

  const approval = await getApproval(id);
  if (
    !approval ||
    !Array.isArray(approval.updates) ||
    approval.updates.length === 0
  ) {
    throw new QueryError(`Approval thread with ID\`${id}\` is invalid.`);
  }

  const lastUpdate = approval.updates[approval.updates.length - 1];
  if (lastUpdateId !== lastUpdate._id) {
    throw new QueryError(`Approval thread request is out-of-date.`);
  }

  const status = updates.status || lastUpdate.status;
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
      status,
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

  return parseMongoData(updatedApproval);
};

const deleteApproval = async (id) => {
  assertObjectIdString(id);

  const collection = await getApprovalCollection();
  const { value: deletedApproval, ok } = await collection.findOneAndDelete(
    idQuery(id)
  );

  if (!ok || !deletedApproval) {
    throw new QueryError(`Could not delete approval with ID of ${id}`);
  }

  return parseMongoData(deletedApproval);
};

module.exports = {
  APPROVAL_STATUS,
  createApproval,
  getApproval,
  assertApprovalUpdates,
  updateApproval,
  deleteApproval,
};
