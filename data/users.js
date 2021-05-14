const { ObjectId, ObjectID } = require("mongodb");
const {
  users: getUserCollection,
} = require("../config/mongoCollections");

const corporateData = require('./corporate');

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
  assertUserRole,
  assertEmailString,
  assertContactString,
  assertPasswordString,
  assertHashedPasswordString
} = require("../utils/assertion");
const {
  USER_ROLE
} = require('../utils/constants');

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

const getAllUsers = async (user) => {
    const collection = await getUserCollection();

    const role = user.role;

    let userList = {};

    if (role === USER_ROLE.ADMIN) {
      userList = await collection.find({}).toArray();
    }
    else{
      userList = await collection.find({ corporateId : new ObjectId(user.corporateId) }).toArray();
    }

    return userList;
};
  
const getUser = async (id) => {
    assertObjectIdString(id);
    return await getByObjectId(new ObjectId(id));
};

const createUser = async (data) => {
    assertRequiredObject(data);
  
    const { corporateId, rankId, name, password, email, contact, designation, rank, role, createdBy, createdAt = new Date().getTime() } = data;
  
    assertUserRole(role, "User Role");

    if (role == USER_ROLE.ADMIN && corporateId && rankId && designation && rank) {
      throw new ValidationError(`Super Admin has invalid data`);
    }
      
    if (role !== USER_ROLE.ADMIN) {
      assertObjectIdString(corporateId, "Corporate ID");
    }
    if (role === USER_ROLE.EMPLOYEE) {
      assertObjectIdString(rankId, "Rank ID"); 
    }   
    assertIsValuedString(name, "User name");
    assertHashedPasswordString(password, "Password");
    assertEmailString(email, "Email");
    assertContactString(contact, "Contact Number");
    if (role === USER_ROLE.EMPLOYEE) {
      assertIsValuedString(designation, "Designation");
    }
    if (role === USER_ROLE.EMPLOYEE) {
      assertRequiredNumber(rank, "Rank");
    }
    assertIsValuedString(createdBy, "Created By");
    assertRequiredNumber(createdAt, "User created time");

    const corporate = await corporateData.getCorporate(corporateId);
    assertCorporateDomainString(corporate.emailDomain, email);
  
    const userData = {
      _id: new ObjectId(),
      corporateId: role == USER_ROLE.ADMIN ? null : new ObjectId(corporateId),
      rankId: role == USER_ROLE.ADMIN || role == USER_ROLE.CORPORATE ? null : new ObjectId(rankId),
      name : name,
      password: password,
      email: email,
      contact: contact,
      designation: ( role == USER_ROLE || role == USER_ROLE.CORPORATE ) ? null : designation,
      rank: ( role == USER_ROLE.ADMIN || role == USER_ROLE.CORPORATE ) ? null : rank,
      role: role,
      createdBy: role == USER_ROLE.ADMIN ? 'System' : createdBy,
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
    assertRequiredObject(updates, "User updates data");

    const { corporateId, rankId, name, email, contact, designation, rank, role } = updates;
  
    assertUserRole(role, "User Role");

    if (role == USER_ROLE.ADMIN && corporateId && rankId && designation && rank) {
      throw new ValidationError(`Super Admin has invalid data`);
    }

    if (role !== USER_ROLE.ADMIN) {
      assertObjectIdString(corporateId, "Corporate ID");
    }
    if (role === USER_ROLE.EMPLOYEE) {
      assertObjectIdString(rankId, "Rank ID"); 
    }   
    assertIsValuedString(name, "User name");
    assertEmailString(email, "Email");
    assertContactString(contact, "Contact Number");
    if (role === USER_ROLE.EMPLOYEE) {
      assertIsValuedString(designation, "Designation");
    }
    if (role === USER_ROLE.EMPLOYEE) {
      assertRequiredNumber(rank, "Rank");
    }

    const corporate = await corporateData.getCorporate(corporateId);
    assertCorporateDomainString(corporate.emailDomain, email);
  
    const user = await getUser(id);

    if (!user) {
      throw new QueryError(`User with ID\`${id}\` not found.`);
    }

    // TODO: validate session user ID and operation
  
    const options = { returnOriginal: false };
    const collection = await getUserCollection();
    const currentTimestamp = new Date().getTime();
    
    const newUpdate = {
      corporateId: role == USER_ROLE.ADMIN ? null : new ObjectId(corporateId),
      rankId: role == USER_ROLE.ADMIN || role == USER_ROLE.CORPORATE ? null : new ObjectId(rankId),
      name : name,
      email: email,
      contact: contact,
      designation: ( role == USER_ROLE || role == USER_ROLE.CORPORATE ) ? null : designation,
      rank: ( role == USER_ROLE.ADMIN || role == USER_ROLE.CORPORATE ) ? null : rank,
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
      throw new QueryError(`Could not update user with ID \`${id}\``);
    }
  
    return parseMongoData(updatedUser);
};

const deleteUser = async (id) => {
    const collection = await getUserCollection();  

    const deletionInfo = await collection.deleteOne({ _id: new ObjectID(id) });

    if (deletionInfo.deletedCount === 0) {
        throw new QueryError(`Could not delete user with id of ${id}`);
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