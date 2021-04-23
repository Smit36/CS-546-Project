const { ObjectId, ObjectID } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const expenses = mongoCollections.expenses;
const expenseCollection = await expenses();

const { QueryError, ValidationError } = require('../utils/errors');
const { idQuery, parseMongoData, stringifyObjectId } = require('../utils/mongodb');
const {
  assertObjectIdString,
  assertIsValuedString,
  assertRequiredObject,
} = require('../utils/assertion');

const getByObjectId = async (objectId) => {
  const expense = await expenseCollection.findOne(idQuery(objectId));
  return parseMongoData(expense);
};

const getExpense = async (expenseId) => {
  assertObjectIdString(expenseId, 'Expense id');

  let expense = await getByObjectId(new ObjectId(expenseId));
  if (expense == null) {
    throw new QueryError(`Could not get expense for (${expenseId})`);
  }
  return expense;
};

const getAllExpenses = async (tripId) => {
  assertObjectIdString(tripId, 'Trip id');

  const trip = await getTrip(tripId);

  const allExpenses = await expenseCollection.find({ tripId: trip._id }).toArray();
  if (allExpenses.length == 0) {
    throw new QueryError(`Trip not found for trip ID(${tripId})`);
  }

  return allExpenses;
};

const addExpense = async (data) => {
  assertRequiredObject(data);

  const { userId, tripId, paymentId, name, description = null } = data;
  const createdAt = new Date().getTime();

  assertObjectIdString(userId, 'Expense added by user ID');
  assertObjectIdString(tripId, 'Expense trip ID');
  assertObjectIdString(paymentId, 'Expense payment ID');
  assertIsValuedString(name, 'Expense name');

  const expenseData = {
    _id: new ObjectId(),
    userId: new ObjectId(userId),
    paymentId: new ObjectId(paymentId),
    tripId: new ObjectId(tripId),
    name,
    description,
    createdAt,
    updatedAt: createdAt,
    createdBy: new ObjectId(userId),
    updatedBy: new ObjectId(userId),
  };

  const { result, insertedCount, insertedId } = await expenseCollection.insertOne(expenseData);

  if (!result.ok || insertedCount !== 1) {
    throw new QueryError(`Could not add expense for trip ID(${tripId})`);
  }

  return await getByObjectId(insertedId);
};

const updateExpense = async (expenseId, data) => {
  assertRequiredObject(data);
  const { userId, tripId, paymentId, name, description = null } = data;
  assertObjectIdString(expenseId, 'Expense id');
  assertObjectIdString(userId, 'Expense added by user ID');
  assertObjectIdString(tripId, 'Expense trip ID');
  assertObjectIdString(paymentId, 'Expense payment ID');
  assertIsValuedString(name, 'Expense name');

  const lastExpense = await getByObjectId(new Object(expenseId));

  if (lastExpense == null) {
    throw new QueryError(`Expense not found for expense ID(${expenseId})`);
  }

  const newUpdate = {
    userId: new ObjectId(userId),
    paymentId: new ObjectId(paymentId),
    tripId: new ObjectId(tripId),
    name,
    description,
    updatedAt: new Date.getTime(),
    updatedBy: new ObjectId(userId),
  };

  const { modifiedCount, matchedCount } = await expenseCollection.updateOne(
    { _id: new ObjectId(expenseId) },
    { $set: newUpdate },
  );

  if (!modifiedCount && !matchedCount) {
    throw new QueryError(`Could not update expense ID(${expenseId})`);
  }
  const updatedExpense = await getByObjectId(new ObjectId(expenseId));
  return updatedExpense;
};

const deleteExpense = async (expenseId) => {
  assertObjectIdString(expenseId, 'Expense id');

  let deleteExpense = await getByObjectId(new ObjectId(expenseId));
  if (deleteExpense == null) {
    throw new QueryError(`Expense not found for expense ID(${expenseId})`);
  }

  let { deletedCount } = await expenseCollection.deleteOne({ _id: new ObjectId(expenseId) });

  if (deletedCount === 0) {
    throw new QueryError(`Could not delete expense for (${expenseId})`);
  }

  deleteExpense.message = 'Successfully deleted';
  return deleteExpense;
};

const deleteAllExpenses = async (tripId) => {
  const allExpenses = await getAllExpenses(tripId);

  const { deletedCount } = await expenseCollection.deleteMany({ tripId: new ObjectId(tripId) });
  if (deletedCount === 0) {
    throw new QueryError(`Could not delete all expenses for (${tripId})`);
  }

  allExpenses.message = 'Successfully deleted';
  return allExpenses;
};

module.exports = {
  getExpense,
  getAllExpenses,
  addExpense,
  updateExpense,
  deleteAllExpenses,
  deleteExpense,
};
