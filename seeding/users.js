const { ObjectId } = require("mongodb");
const { stringifyObjectId } = require("../utils/mongodb");
const { createUser } = require("../data/users");


const seedUsers = async ({
    userId1 = new ObjectId(),
    userId2 = new ObjectId(),
    userId3 = new ObjectId(),
    userId4 = new ObjectId(),
    userId5 = new ObjectId(),
    timestamp1 = new Date().getTime(),
    timestamp2 = new Date().getTime(),
    timestamp3 = new Date().getTime(),
    corporateId1 = new ObjectId(),
    corporateId2 = new ObjectId(),
    rankId1 = new ObjectId(),
    rankId2 = new ObjectId(),
    rankId3 = new ObjectId(),
} = {}) => {

    const userData1 = {
        _id: userId1,
        corporateId: corporateId1,
        rankId: rankId1,
        name : "Admin",
        password: "p@ssw0rd123",
        email: "admin@gmail.com",
        contact: "1234567890",
        designation: "Admin",
        rank: 10,
        role: "Admin",
        createdBy: userId1,
        createdAt: timestamp1,
        updatedAt: timestamp1,
    };

    const userData2 = {
        _id: userId2,
        corporateId: corporateId1,
        rankId: rankId1,
        name : "Test User 1",
        password: "p@ssw0rd123",
        email: "user1@gmail.com",
        contact: "1234877890",
        designation: "Manager",
        rank: 3,
        role: "Corporate",
        createdBy: userId1,
        createdAt: timestamp1,
        updatedAt: timestamp1,
    };

    const userData3 = {
      _id: userId3,
      corporateId: corporateId1,
      rankId: rankId2,
      name : "Test User 3",
      password: "p@ssw0rd123",
      email: "user3@gmail.com",
      contact: "2054877890",
      designation: "Software developer",
      rank: 2,
      role: "User",
      createdBy: userId2,
      createdAt: timestamp2,
      updatedAt: timestamp2,
  };

  const userData4 = {
    _id: userId4,
    corporateId: corporateId2,
    rankId: rankId1,
    name : "Test User 4",
    password: "p@ssw0rd123",
    email: "user4@gmail.com",
    contact: "2014877890",
    designation: "Manager",
    rank: 3,
    role: "Corporate",
    createdBy: userId1,
    createdAt: timestamp2,
    updatedAt: timestamp2,
  };

  const userData5 = {
    _id: userId5,
    corporateId: corporateId2,
    rankId: rankId2,
    name : "Test User 5",
    password: "p@ssw0rd123",
    email: "user5@gmail.com",
    contact: "2015577890",
    designation: "Associate",
    rank: 2,
    role: "User",
    createdBy: userId4,
    createdAt: timestamp3,
    updatedAt: timestamp3,
  };

  const user1 = await createUser(userData1);
  const user2 = await createUser(userData2);
  const user3 = await createUser(userData3);  
  const user4 = await createUser(userData4);
  const user5 = await createUser(userData5);


  return {
    user1,
    user2,
    user3,
    user4,
    user5
  };
};

  module.exports = seedUsers;
