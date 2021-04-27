const { ObjectId, ObjectID } = require('mongodb');
const { expenses: getExpensesCollection } = require('../config/mongoCollections');

const { QueryError, ValidationError } = require('../utils/errors');
const { idQuery, parseMongoData, stringifyObjectId } = require('../utils/mongodb');
const {
  assertObjectIdString,
  assertIsValuedString,
  assertRequiredObject,
} = require('../utils/assertion');

const getByObjectId = async (objectId) => {
  const collection = await getExpensesCollection();
  const expense = await collection.findOne(idQuery(objectId));
  return parseMongoData(expense);
};

const getExpense = async (expenseId) => {
  assertObjectIdString(expenseId, 'Expense id');

  let expense = await getByObjectId(expenseId);
  if (expense == null) {
    throw new QueryError(`Could not get expense for (${expenseId})`);
  }
  console.log(typeof expense._id);
  return expense;
};

const getAllExpensesByTrip = async (tripId) => {
  assertObjectIdString(tripId, 'Trip id');

  //const trip = await getTrip(tripId);

  const collection = await getExpensesCollection();
  const allExpenses = await collection.find({ tripId: new ObjectId(tripId) }).toArray();
  if (allExpenses.length == 0) {
    throw new QueryError(`Expenses not found`);
  }

  for (let i = 0; i < allExpenses.length; i++) {
    allExpenses[i]._id = allExpenses[i]._id.toString();
  }

  return allExpenses;
};

const addExpense = async (data) => {
  assertRequiredObject(data);
  console.log(data);
  const { userId, tripId, paymentId, name, description = null } = data;
  const createdAt = new Date().getTime();

  assertObjectIdString(userId, 'Expense added by user ID');
  assertObjectIdString(tripId, 'Expense trip ID');
  assertObjectIdString(paymentId, 'Expense payment ID');
  assertIsValuedString(name, 'Expense name');

  const collection = await getExpensesCollection();

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
  const { result, insertedCount, insertedId } = await collection.insertOne(expenseData);
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

  const lastExpense = await getByObjectId(expenseId);

  if (lastExpense == null) {
    throw `Expense not found for expense ID(${expenseId})`;
  }

  const newUpdate = {
    userId: new ObjectId(userId),
    paymentId: new ObjectId(paymentId),
    tripId: new ObjectId(tripId),
    name,
    description,
    updatedAt: new Date().getTime(),
    updatedBy: new ObjectId(userId),
  };

  const collection = await getExpensesCollection();
  const { modifiedCount, matchedCount } = await collection.updateOne(
    { _id: new ObjectId(expenseId) },
    { $set: newUpdate },
  );

  if (!modifiedCount && !matchedCount) {
    throw new QueryError(`Could not update expense ID(${expenseId})`);
  }
  const updatedExpense = await getByObjectId(expenseId);
  return updatedExpense;
};

const deleteExpense = async (expenseId) => {
  assertObjectIdString(expenseId, 'Expense id');

  let deleteExpense = await getByObjectId(new ObjectId(expenseId));
  if (deleteExpense == null) {
    throw `Expense not found for expense ID(${expenseId})`;
  }

  const collection = await getExpensesCollection();
  let { deletedCount } = await collection.deleteOne({ _id: new ObjectId(expenseId) });

  if (deletedCount === 0) {
    throw new QueryError(`Could not delete expense for (${expenseId})`);
  }

  deleteExpense.message = 'Successfully deleted';
  return deleteExpense;
};

const deleteAllExpensesByTrip = async (tripId) => {
  const allExpenses = await getAllExpensesByTrip(tripId);

  const collection = await getExpensesCollection();
  const { deletedCount } = await collection.deleteMany({ tripId: new ObjectId(tripId) });
  if (deletedCount === 0) {
    throw new QueryError(`Could not delete all expenses for (${tripId})`);
  }

  allExpenses.message = 'Successfully deleted';
  return allExpenses;
};

module.exports = {
  getExpense,
  getAllExpensesByTrip,
  addExpense,
  updateExpense,
  deleteAllExpensesByTrip,
  deleteExpense,
};
