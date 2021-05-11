const { ObjectId } = require("mongodb");
const { stringifyObjectId } = require("../utils/mongodb");
const { createRank } = require("../data/rank");

const seedRanks = async ({
  timestamp1 = new Date().getTime(),
  timestamp2 = new Date().getTime(),
  timestamp3 = new Date().getTime(),
  corporate1Id = new ObjectId(),
  corporate2Id = new ObjectId(),
} = {}) => {
  const rankData1 = {
    _id: new ObjectId(),
    corporateId: stringifyObjectId(corporate1Id),
    name: "Manager",
    level: 3,
    createdAt: timestamp1,
    updatedAt: timestamp1,
  };

  const rankData2 = {
    _id: new ObjectId(),
    corporateId: stringifyObjectId(corporate1Id),
    name: "Accountant",
    level: 2,
    createdAt: timestamp2,
    updatedAt: timestamp2,
  };

  const rankData3 = {
    _id: new ObjectId(),
    corporateId: stringifyObjectId(corporate1Id),
    name: "Associate",
    level: 1,
    createdAt: timestamp1,
    updatedAt: timestamp1,
  };

  const rankData4 = {
    _id: new ObjectId(),
    corporateId: stringifyObjectId(corporate2Id),
    name: "Tech Lead",
    level: 3,
    createdAt: timestamp1,
    updatedAt: timestamp1,
  };

  const rankData5 = {
    _id: new ObjectId(),
    corporateId: stringifyObjectId(corporate2Id),
    name: "Senior Developer",
    level: 2,
    createdAt: timestamp1,
    updatedAt: timestamp1,
  };

  const rankData6 = {
    _id: new ObjectId(),
    corporateId: stringifyObjectId(corporate2Id),
    name: "Developer",
    level: 1,
    createdAt: timestamp1,
    updatedAt: timestamp1,
  };

  const corporate1RankManager = await createRank(rankData1);
  const corporate1RankAccountant = await createRank(rankData2);
  const corporate1RankAssociate = await createRank(rankData3);
  const corporate2RankTechLead = await createRank(rankData4);
  const corporate2RankSeniorDeveloper = await createRank(rankData5);
  const corporate2RankDeveloper = await createRank(rankData6);

  return {
    corporate1RankManager,
    corporate1RankAccountant,
    corporate1RankAssociate,
    corporate2RankTechLead,
    corporate2RankSeniorDeveloper,
    corporate2RankDeveloper,
  };
};

module.exports = seedRanks;
