const { ObjectId } = require("mongodb");
const { stringifyObjectId } = require("../utils/mongodb");
const { createUser } = require("../data/users");

const seedPortalAdminUsers = async ({
  timestamp1 = new Date().getTime(),
  timestamp2 = new Date().getTime(),
  password,
} = {}) => {
  const adminData1 = {
    name: "Portal Admin1",
    password: password,
    email: "admin1@ctem.com",
    contact: "213-456-7890",
    role: "ADMIN",
    createdBy: "System",
    createdAt: timestamp1,
    updatedAt: timestamp1,
  };

  const adminData2 = {
    name: "Admin2",
    password: password,
    email: "admin2@ctem.com",
    contact: "201-456-7000",
    role: "ADMIN",
    createdBy: "System",
    createdAt: timestamp2,
    updatedAt: timestamp2,
  };

  const admin1 = await createUser(adminData1);
  const admin2 = await createUser(adminData2);

  return { admin1, admin2 };
};

const seedCorporateAdminUsers = async ({
  admin1Id = new ObjectId(),
  admin2Id = new ObjectId(),
  corporate1Id = new ObjectId(),
  corporate2Id = new ObjectId(),
  timestamp1 = new Date().getTime(),
  password,
} = {}) => {
  const corporateAdminData1 = {
    name: "Gigasoft Admin",
    corporateId: stringifyObjectId(corporate1Id),
    password: password,
    email: "admin@gigasoft.com",
    contact: "123-487-7890",
    role: "CORPORATE",
    createdBy: stringifyObjectId(admin1Id),
    createdAt: timestamp1,
    updatedAt: timestamp1,
  };
  const corporateAdminData2 = {
    name: "Microhard Admin",
    corporateId: stringifyObjectId(corporate2Id),
    password: password,
    email: "admin@microhard.com",
    contact: "123-487-7899",
    role: "CORPORATE",
    createdBy: stringifyObjectId(admin2Id),
    createdAt: timestamp1,
    updatedAt: timestamp1,
  };

  const corporate1Admin = await createUser(corporateAdminData1);
  const corporate2Admin = await createUser(corporateAdminData2);

  return {
    corporate1Admin,
    corporate2Admin,
  };
};

const seedUsers = async ({
  timestamp1 = new Date().getTime(),
  timestamp2 = new Date().getTime(),
  timestamp3 = new Date().getTime(),
  corporate1Id = new ObjectId(),
  corporate2Id = new ObjectId(),
  corporateAdmin1Id = new ObjectId(),
  corporateAdmin2Id = new ObjectId(),
  rank1,
  rank2,
  rank3,
  rank4,
  rank5,
  rank6,
  password,
} = {}) => {
  const userData1 = {
    corporateId: stringifyObjectId(corporate1Id),
    name: "Gina the Manager",
    password: password,
    email: "user1@gigasoft.com",
    contact: "101-117-7890",
    role: "EMPLOYEE",
    rankId: rank1._id,
    rank: rank1.level,
    designation: rank1.name,
    createdBy: stringifyObjectId(corporateAdmin1Id),
    createdAt: timestamp1,
    updatedAt: timestamp1,
  };

  const userData2 = {
    corporateId: stringifyObjectId(corporate1Id),
    name: "Ghibli the Accountant",
    password: password,
    email: "user2@gigasoft.com",
    contact: "201-227-7890",
    role: "EMPLOYEE",
    rankId: rank2._id,
    rank: rank2.level,
    designation: rank2.name,
    createdBy: stringifyObjectId(corporateAdmin1Id),
    createdAt: timestamp2,
    updatedAt: timestamp2,
  };

  const userData3 = {
    corporateId: stringifyObjectId(corporate1Id),
    name: "George the Associate",
    password: password,
    email: "user3@gigasoft.com",
    contact: "201-337-7890",
    role: "EMPLOYEE",
    rankId: rank3._id,
    rank: rank3.level,
    designation: rank3.name,
    createdBy: stringifyObjectId(corporateAdmin1Id),
    createdAt: timestamp3,
    updatedAt: timestamp3,
  };

  const userData4 = {
    corporateId: stringifyObjectId(corporate2Id),
    name: "Mary the Tech Lead",
    password: password,
    email: "user1@microhard.com",
    contact: "201-447-7890",
    role: "EMPLOYEE",
    rankId: rank4._id,
    rank: rank4.level,
    designation: rank4.name,
    createdBy: stringifyObjectId(corporateAdmin2Id),
    createdAt: timestamp1,
    updatedAt: timestamp1,
  };

  const userData5 = {
    corporateId: stringifyObjectId(corporate2Id),
    name: "Mike the Senior Dev",
    password: password,
    email: "user2@microhard.com",
    contact: "201-557-7890",
    role: "EMPLOYEE",
    rankId: rank5._id,
    rank: rank5.level,
    designation: rank5.name,
    createdBy: stringifyObjectId(corporateAdmin2Id),
    createdAt: timestamp2,
    updatedAt: timestamp2,
  };

  const userData6 = {
    corporateId: stringifyObjectId(corporate2Id),
    name: "Milly the Junior Dev",
    password: password,
    email: "user3@microhard.com",
    contact: "201-667-7890",
    role: "EMPLOYEE",
    rankId: rank6._id,
    rank: rank6.level,
    designation: rank6.name,
    createdBy: stringifyObjectId(corporateAdmin2Id),
    createdAt: timestamp3,
    updatedAt: timestamp3,
  };

  const corporate1User1 = await createUser(userData1);
  const corporate1User2 = await createUser(userData2);
  const corporate1User3 = await createUser(userData3);
  const corporate2User1 = await createUser(userData4);
  const corporate2User2 = await createUser(userData5);
  const corporate2User3 = await createUser(userData6);

  return {
    corporate1User1,
    corporate1User2,
    corporate1User3,
    corporate2User1,
    corporate2User2,
    corporate2User3,
  };
};

module.exports = { seedPortalAdminUsers, seedCorporateAdminUsers, seedUsers };
