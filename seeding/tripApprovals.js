const { ObjectId } = require("mongodb");
const { stringifyObjectId } = require("../utils/mongodb");
const { createTrip } = require("../data/trips");
const {
  updateApproval,
  getApproval,
  APPROVAL_STATUS,
} = require("../data/approvals");

const seedTripsAndApprovals = async ({
  user1Id = new ObjectId(),
  user2Id = new ObjectId(),
  user3Id = new ObjectId(),
  user4Id = new ObjectId(),
  user5Id = new ObjectId(),
  timestamp1 = new Date().getTime(),
  timestamp2 = new Date().getTime(),
  timestamp3 = new Date().getTime(),
  corporate1Id = new ObjectId(),
  corporate2Id = new ObjectId(),
} = {}) => {
  const tripData1 = {
    userId: stringifyObjectId(user1Id),
    corporateId: stringifyObjectId(corporate1Id),
    managerId: stringifyObjectId(user1Id),
    employeeIdList: [stringifyObjectId(user2Id)],
    name: "Business trip to Death Star",
    description: "Business trip to Death Star traveling on the Star Destroyer",
    startTime: timestamp1,
    endTime: timestamp3,
  };

  const tripData2 = {
    userId: stringifyObjectId(user3Id),
    corporateId: stringifyObjectId(corporate2Id),
    managerId: stringifyObjectId(user3Id),
    employeeIdList: [stringifyObjectId(user4Id), stringifyObjectId(user5Id)],
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
    userId: stringifyObjectId(user2Id),
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
