const { ObjectId } = require("mongodb");
const { connect, disconnect } = require("../config/mongoConnection");

const {
  seedUsers,
  seedCorporateAdminUsers,
  seedPortalAdminUsers,
} = require("./users");
const seedRanks = require("./ranks");
const seedTripsAndApprovals = require("./tripApprovals");
const { seedCorporates } = require("./corporates");
const { stringifyObjectId } = require("../utils/mongodb");
const seedExpense = require("./expense");

const qwer = "$2b$08$HXw/sdQ4tgsgPf9wAHiSuuqOZefJNy9YuKrRviBwnLQmxhTlHCyE.";

const unseed = async (db) => {
  if (!!db) {
    console.log("dropping seeded database");
    await db.dropDatabase();
  }
};

const seed = async () => {
  let db = await connect();

  try {
    await unseed(db);

    const { admin1, admin2 } = await seedPortalAdminUsers({
      password: qwer,
    });

    const admin1Id = new ObjectId(admin1._id);
    const admin2Id = new ObjectId(admin2._id);

    const { corporate1, corporate2 } = await seedCorporates({
      admin1Id,
      admin2Id,
    });

    const corporate1Id = new ObjectId(corporate1._id);
    const corporate2Id = new ObjectId(corporate2._id);

    const { corporate1Admin, corporate2Admin } = await seedCorporateAdminUsers({
      admin1Id,
      admin2Id,
      corporate1Id,
      corporate2Id,
      password: qwer,
    });

    const {
      corporate1RankManager,
      corporate1RankAccountant,
      corporate1RankAssociate,
      corporate2RankTechLead,
      corporate2RankSeniorDeveloper,
      corporate2RankDeveloper,
    } = await seedRanks({
      corporate1Id,
      corporate2Id,
    });

    const {
      corporate1User1: corporate1Manager,
      corporate1User2: corporate1Accountant,
      corporate1User3: corporate1Associate,
      corporate2User1: corporate2TechLead,
      corporate2User2: corporate2SeniorDeveloper,
      corporate2User3: corporate2Developer,
    } = await seedUsers({
      corporate1Id,
      corporate2Id,
      corporateAdmin1Id: new ObjectId(corporate1Admin._id),
      corporateAdmin2Id: new ObjectId(corporate2Admin._id),
      rank1: corporate1RankManager,
      rank2: corporate1RankAccountant,
      rank3: corporate1RankAssociate,
      rank4: corporate2RankTechLead,
      rank5: corporate2RankSeniorDeveloper,
      rank6: corporate2RankDeveloper,
      password: qwer,
    });

    const {
      trip1: corporate1Trip,
      trip2: corporate2Trip,
    } = await seedTripsAndApprovals({
      corporate1Id,
      corporate2Id,
      user1Id: new ObjectId(corporate1Manager._id),
      user2Id: new ObjectId(corporate1Accountant._id),
      user3Id: new ObjectId(corporate2TechLead._id),
      user4Id: new ObjectId(corporate2SeniorDeveloper._id),
      user5Id: new ObjectId(corporate2Developer._id),
    });

    const seedExpenses = await seedExpense({
      user1Id: new ObjectId(corporate1Accountant._id),
      user2Id: new ObjectId(corporate2Developer._id),
      trip1Id: new ObjectId(corporate1Trip._id),
      trip2Id: new ObjectId(corporate2Trip._id),
    });

    return {
      // ...seedData,
    };
  } catch (error) {
    console.log("Seeding error:", error);
    await unseed(db);
    await disconnect();
  }
};

module.exports = seed;
