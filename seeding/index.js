const { connect, disconnect } = require("../config/mongoConnection");
// const getCollectionSeedData = require('./collection');

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
  
    // const seedDataBundle = await getCollectionSeedData();
  
    console.log('Seeding completed.');
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
