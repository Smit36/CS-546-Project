const { ObjectId } = require("mongodb");
const { createCorporate } = require("../data/corporate");

const seedCorporate = async () => {
  const corporateData1 = {
    name: "Stevens Institute of technology",
    emailDomain: "stevens@stevens.edu",
    contactNo: "201-216-5000",
    address: "Hoboken",
    createdBy: new ObjectId("608c14d031a2df4a7cc07372"),
    updatedBy: new ObjectId("608c14d031a2df4a7cc07372"),
  };

  const corporateData2 = {
    name: "Apple",
    emailDomain: "appleid@id.apple.com",
    contactNo: "800-692-7753",
    address: "California",
    createdBy: new ObjectId("608c14d031a2df4a7cc07372"),
    updatedBy: new ObjectId("608c14d031a2df4a7cc07372"),
  };

  const corporateData3 = {
    name: "Goldman Sachs",
    emailDomain: "careersfeedback@ny.email.gs.com",
    contactNo: "212-902-1000",
    address: "New York",
    createdBy: new ObjectId("608c14d031a2df4a7cc07372"),
    updatedBy: new ObjectId("608c14d031a2df4a7cc07372"),
  };

  const corporateData4 = {
    name: "Amazon",
    emailDomain: "support@amazon.com",
    contactNo: "888-280-4331",
    address: "Northern Virginia",
    createdBy: new ObjectId("608c14d031a2df4a7cc07372"),
    updatedBy: new ObjectId("608c14d031a2df4a7cc07372"),
  };

  const corporateData5 = {
    name: "Google",
    emailDomain: "support@google.com",
    contactNo: "866-246-6453",
    address: "California",
    createdBy: new ObjectId("608c14d031a2df4a7cc07372"),
    updatedBy: new ObjectId("608c14d031a2df4a7cc07372"),
  };

  const corporate1 = await createCorporate(corporateData1);

  const corporate2 = await createCorporate(corporateData2);

  const corporate3 = await createCorporate(corporateData3);

  const corporate4 = await createCorporate(corporateData4);

  const corporate5 = await createCorporate(corporateData5);

  return { corporate1, corporate2, corporate3, corporate4, corporate5 };
};

module.exports = {
  seedCorporate
};
