const { connect, disconnect } = require("../config/mongoConnection");
// const getCollectionSeedData = require('./collection');
const { seedCorporate } = require('./corporate');

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
    const {corporate1, corporate2, corporate3, corporate4, corporate5} = await seedCorporate();
  
  
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
