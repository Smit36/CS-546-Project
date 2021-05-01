const { ObjectId } = require("mongodb");
const dbConnection = require("../config/mongoConnection");
const { createCorporate } = require("../data/corporate");

const main = async () => {
  const db = await dbConnection.connect();
  await db.dropDatabase();

  const c1 = {
    name: "Stevens Institute of technology",
    emailDomain: "stevens@stevens.edu",
    contactNo: "201-216-5000",
    address: "Hoboken",
    createdBy: new ObjectId("608c14d031a2df4a7cc07372"),
    updatedBy: new ObjectId("608c14d031a2df4a7cc07372"),
  };
  const c2 = {
    name: "Apple",
    emailDomain: "appleid@id.apple.com",
    contactNo: "800-692-7753",
    address: "California",
    createdBy: new ObjectId("608c14d031a2df4a7cc07372"),
    updatedBy: new ObjectId("608c14d031a2df4a7cc07372"),
  };
  const c3 = {
    name: "Goldman Sachs",
    emailDomain: "careersfeedback@ny.email.gs.com",
    contactNo: "212-902-1000",
    address: "New York",
    createdBy: new ObjectId("608c14d031a2df4a7cc07372"),
    updatedBy: new ObjectId("608c14d031a2df4a7cc07372"),
  };
  const c4 = {
    name: "Amazon",
    emailDomain: "support@amazon.com",
    contactNo: "888-280-4331",
    address: "Northern Virginia",
    createdBy: new ObjectId("608c14d031a2df4a7cc07372"),
    updatedBy: new ObjectId("608c14d031a2df4a7cc07372"),
  };
  const c5 = {
    name: "Google",
    emailDomain: "support@google.com",
    contactNo: "866-246-6453",
    address: "California",
    createdBy: new ObjectId("608c14d031a2df4a7cc07372"),
    updatedBy: new ObjectId("608c14d031a2df4a7cc07372"),
  };
  const corporate1 = await createCorporate(c1);

  const corporate2 = await createCorporate(c2);

  const corporate3 = await createCorporate(c3);

  const corporate4 = await createCorporate(c4);

  const corporate5 = await createCorporate(c5);

  console.log("Done seeding database");
  await db.serverConfig.close();
};
main().catch(console.log);
