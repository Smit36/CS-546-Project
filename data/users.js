const { ObjectId, ObjectID } = require("mongodb");
const {
  users: getUserCollection,
} = require("../config/mongoCollections");

const { QueryError, ValidationError } = require("../utils/errors");
const {
  idQuery,
  parseMongoData,
  stringifyObjectId,
} = require("../utils/mongodb");
const {
  assertObjectIdString,
  assertIsValuedString,
  assertRequiredObject,
  assertRequiredNumber,
} = require("../utils/assertion");

const getByObjectId = async (objectId) => {
    const collection = await getUserCollection();
    const user = await collection.findOne(idQuery(objectId));
    return parseMongoData(user);
};

const getUserByEmail = async (email) => {
    assertIsValuedString(email, 'Email ID');

    const collection = await getUserCollection();
    const user = await collection.findOne({ email });
    return parseMongoData(user);
}

const getAllUsers = async () => {
    const collection = await getUserCollection();

    const userList = await collection.find({}).toArray();

    return userList;
};
  
const getUser = async (id) => {
    assertObjectIdString(id);
    return await getByObjectId(new ObjectId(id));
};

const createUser = async (data) => {
    assertRequiredObject(data);
  
    const { corporateId, rankId, name, password, email, contact, designation, rank, role, createdBy, createdAt = new Date().getTime() } = data;
  
    assertObjectIdString(corporateId, "Corporate ID");
    assertObjectIdString(rankId, "Rank ID");    
    assertIsValuedString(name, "User name");
    assertIsValuedString(password, "Password");
    assertIsValuedString(email, "Email");
    assertRequiredNumber(contact, "Contact Number");
    assertIsValuedString(designation, "Designation");
    assertIsValuedString(role, "Role");
    assertRequiredNumber(rank, "Rank");
    assertIsValuedString(createdBy, "Created By");
    assertRequiredNumber(createdAt, "User created time");
  
    const userData = {
      _id: new ObjectId(),
      corporateId: new ObjectId(corporateId),
      rankId: new ObjectId(rankId),
      name : name,
      password: password,
      email: email,
      contact: contact,
      designation: designation,
      rank: rank,
      role: role,
      createdBy: createdBy,
      createdAt: createdAt,
      updatedAt: createdAt,
    };
  
    const collection = await getUserCollection();
    const { result, insertedCount, insertedId } = await collection.insertOne(
      userData
    );
  
    if (!result.ok || insertedCount !== 1) {
      throw new QueryError(`Could not create user for corporate ID(${corporateId})`);
    }
  
    return await getByObjectId(insertedId);
};

const updateUser = async (id, updatedBy, updates) => {
    assertObjectIdString(id);
    assertRequiredObject(updates, "Ranks updates data");

    const { corporateId, rankId, name, password, email, contact, designation, rank, role, createdBy, createdAt = new Date().getTime() } = updates;
  
    assertObjectIdString(corporateId, "Corporate ID");
    assertObjectIdString(rankId, "Rank ID");    
    assertIsValuedString(name, "User name");
    assertIsValuedString(password, "Password");
    assertIsValuedString(email, "Email");
    assertRequiredNumber(contact, "Contact Number");
    assertIsValuedString(designation, "Designation");
    assertIsValuedString(role, "Role");
    assertRequiredNumber(rank, "Rank");
    assertIsValuedString(createdBy, "Created By");
    assertIsValuedString(updatedBy, "Updated By");
    assertRequiredNumber(createdAt, "User created time");
  
    const user = await getUser(id);

    if (!user) {
      throw new QueryError(`User with ID\`${id}\` not found.`);
    }

    // TODO: validate session user ID and operation
  
    const options = { returnOriginal: false };
    const collection = await getUserCollection();
    const currentTimestamp = new Date().getTime();
    
    const newUpdate = {
        corporateId: new ObjectId(corporateId),
        rankId: new ObjectId(rankId),
        name : name,
        password: password,
        email: email,
        contact: contact,
        designation: designation,
        rank: rank,
        role: role,
        updatedBy: updatedBy,
        updatedAt: currentTimestamp,
    };

    const ops = {
      $set: newUpdate      
    };
  
    const { value: updatedUser, ok } = await collection.findOneAndUpdate(
      idQuery(id),
      ops,
      options
    );
  
    if (!ok) {
      throw new QueryError(`Could not update rank with ID \`${id}\``);
    }
  
    return parseMongoData(updatedUser);
};

const deleteUser = async (id) => {
    const collection = await getUserCollection();  

    const deletionInfo = await collection.deleteOne({ _id: new ObjectID(id) });

    if (deletionInfo.deletedCount === 0) {
        throw new QueryError(`Could not delete movie with id of ${id}`);
    }

    if (deletionInfo.deletedCount > 0) {
        return true;
    }
    else {
        return false;
    }
};

module.exports = {
    createUser,
    getUser,
    getAllUsers,
    getUserByEmail,
    updateUser,
    deleteUser
};