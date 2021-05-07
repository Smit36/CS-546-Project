const { ObjectId } = require("mongodb");
const { createCorporate } = require("../data/corporate");
const { stringifyObjectId } = require("../utils/mongodb");

const seedCorporates = async ({
  admin1Id = new ObjectId(),
  admin2Id = new ObjectId(),
} = {}) => {
  stringifyObjectId;
  console.log(admin1Id, admin2Id, 'c');
  const corporateData1 = {
    name: "Gigasoft",
    emailDomain: "x@gigasoft.com",
    contactNo: '201-234-5678',
    address: "123 Fake St, Hoboken, NJ",
    createdBy: admin1Id,
    updatedBy: admin1Id,
  };

  const corporateData2 = {
    name: "Microhard",
    emailDomain: "x@microhard.com",
    contactNo: '800-123-4567',
    address: "567 Real St, Palo Alto, CA",
    createdBy: admin2Id,
    updatedBy: admin2Id,
  };

  const corporate1 = await createCorporate(corporateData1);
  const corporate2 = await createCorporate(corporateData2);

  return {
    corporate1,
    corporate2,
  }
};

module.exports = {
  seedCorporates,
};
