const { ObjectId } = require("mongodb");
const { stringifyObjectId } = require("../utils/mongodb");
const { createTrip } = require("../data/trips");
const {
  updateApproval,
  getApproval,
  APPROVAL_STATUS,
} = require("../data/approvals");

const seedTripsAndApprovals = async ({
  userId1 = new ObjectId(),
  userId2 = new ObjectId(),
  userId3 = new ObjectId(),
  userId4 = new ObjectId(),
  userId5 = new ObjectId(),
  timestamp1 = new Date().getTime(),
  timestamp2 = new Date().getTime(),
  timestamp3 = new Date().getTime(),
  corporateId1 = new ObjectId(),
  corporateId2 = new ObjectId(),
} = {}) => {
  const tripData1 = {
    userId: stringifyObjectId(userId1),
    corporateId: stringifyObjectId(corporateId1),
    managerId: stringifyObjectId(userId1),
    employeeIdList: [stringifyObjectId(userId2)],
    name: "Business trip to Death Star",
    description: "Business trip to Death Star traveling on the Star Destroyer",
    startTime: timestamp1,
    endTime: timestamp3,
  };

  const tripData2 = {
    userId: stringifyObjectId(userId3),
    corporateId: stringifyObjectId(corporateId2),
    managerId: stringifyObjectId(userId3),
    employeeIdList: [stringifyObjectId(userId4), stringifyObjectId(userId5)],
    name: "Business trip to Terra",
    description: "Intersteller business trip to Earth for secret meeting",
    startTime: timestamp1,
    endTime: timestamp3,
  };

  const trip1 = await createTrip(tripData1);
  const trip2 = await createTrip(tripData2);

  let approval1 = await getApproval(trip1.approvalId);
  const approval2 = await getApproval(trip2.approvalId);

  const lastUpdate1 = approval1.updates[approval1.updates.length - 1];
  const approvalUpdateData = {
    lastUpdateId: lastUpdate1._id,
    userId: stringifyObjectId(userId2),
    message: "please approve thanks",
    status: APPROVAL_STATUS.PENDING,
  };

  approval1 = await updateApproval(trip1.approvalId, approvalUpdateData);

  return {
    trip1,
    trip2,
    approval1,
    approval2,
  };
};

module.exports = seedTripsAndApprovals;
