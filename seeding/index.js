const { connect, disconnect } = require("../config/mongoConnection");

const { seedUsers, seedAdminUsers } = require("./users");
const seedRanks = require("./ranks");
const seedTripsAndApprovals = require("./tripApprovals");
const { seedCorporate } = require("./corporate");

const unseed = async (db) => {
  if (!!db) {
    console.log("dropping seeded database");
    await db.dropDatabase();
  }
};

const seed = async () => {
  let db = await connect();
  const seedData = {};

  try {
    await unseed(db);

    // TODO: seed admins
    const { admin1, admin2 } = await seedAdminUsers();

    const {
      corporate1,
      corporate2,
      corporate3,
      corporate4,
      corporate5,
    } = await seedCorporate();

    // TODO: fix rank seeding
    // const { rank1, rank2, rank3, rank4, rank5, rank6 } = await seedRanks();

    // TODO: fix user seeding
    // const { user1, user2, user3, user4, user5 } = await seedUsers({});

    const { trip1, trip2, approval1, approval2 } = await seedTripsAndApprovals({
      // TODO
    });

    console.log("Seeding completed.");
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
