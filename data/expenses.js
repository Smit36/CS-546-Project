const { ObjectId, ObjectID } = require('mongodb');
const { expenses: getExpensesCollection } = require('../config/mongoCollections');

const { QueryError, ValidationError } = require('../utils/errors');
const { idQuery, parseMongoData, stringifyObjectId } = require('../utils/mongodb');
const {
  assertObjectIdString,
  assertIsValuedString,
  assertRequiredObject,
} = require('../utils/assertion');

const {
  addExpensePayment,
  getExpensePayment,
  updateExpensePayment,
  deleteExpensePayment,
} = require('./expensePayments');
const { getTrip } = require('./trips');

const getByObjectId = async (objectId) => {
  const collection = await getExpensesCollection();
  let expense = await collection.findOne(idQuery(objectId));
  return parseMongoData(expense);
};

const getExpense = async (expenseId) => {
  assertObjectIdString(expenseId, 'Expense id');

  let expense = await getByObjectId(expenseId);
  if (expense == null) {
    throw new QueryError(`Could not get expense for (${expenseId})`);
  }
  expense.payment = await getExpensePayment(expense.paymentId);
  return expense;
};

const getAllExpensesByTrip = async (tripId) => {
  assertObjectIdString(tripId, 'Trip id');

  //const trip = await getTrip(tripId);

  const collection = await getExpensesCollection();
  const allExpenses = await collection.find({ tripId: new ObjectId(tripId) }).toArray();
  // if (allExpenses.length == 0) {
  //   throw new QueryError(`Expenses not found`);
  // }
  for (let i = 0; i < allExpenses.length; i++) {
    allExpenses[i].payment = await getExpensePayment(allExpenses[i].paymentId.toHexString());
  }

  return parseMongoData(allExpenses);
};

const getAllExpensesByUser = async (userId) => {
  assertObjectIdString(userId, 'User id');

  //const trip = await getTrip(tripId);

  const collection = await getExpensesCollection();
  const allExpenses = await collection.find({ userId: new ObjectId(userId) }).toArray();
  if (allExpenses.length == 0) {
    return parseMongoData(allExpenses);
  }
  for (let i = 0; i < allExpenses.length; i++) {
    allExpenses[i].payment = await getExpensePayment(allExpenses[i].paymentId.toHexString());
  }
  for (let i = 0; i < allExpenses.length; i++) {
    allExpenses[i].trip = await getTrip(allExpenses[i].tripId.toHexString());
  }

  return parseMongoData(allExpenses);
};

const addExpense = async (data) => {
  assertRequiredObject(data);
  const { userId, tripId, name, description = null } = data;
  const createdAt = new Date().getTime();

  assertObjectIdString(userId, 'Expense added by user ID');
  assertObjectIdString(tripId, 'Expense trip ID');
  assertIsValuedString(name, 'Expense name');

  data.expenseId = new ObjectId().toHexString();
  data.paymentId = new ObjectId().toHexString();

  const collection = await getExpensesCollection();

  const expenseData = {
    _id: new ObjectId(data.expenseId),
    paymentId: new ObjectId(data.paymentId),
    userId: new ObjectId(userId),
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

  let expense = await getByObjectId(insertedId);
  expense.payment = await addExpensePayment(data);

  return expense;
};

const updateExpense = async (expenseId, data) => {
  assertRequiredObject(data);
  const { userId, tripId, name, description = null } = data;
  assertObjectIdString(expenseId, 'Expense id');
  assertObjectIdString(userId, 'Expense added by user ID');
  assertObjectIdString(tripId, 'Expense trip ID');
  assertIsValuedString(name, 'Expense name');

  const lastExpense = await getExpense(expenseId);

  if (lastExpense == null) {
    throw `Expense not found for expense ID(${expenseId})`;
  }

  const newUpdate = {
    userId: new ObjectId(userId),
    paymentId: new ObjectId(lastExpense.paymentId),
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
  const updatedExpense = await getExpense(expenseId);
  data.expenseId = expenseId;
  updatedExpense.payment = await updateExpensePayment(updatedExpense.paymentId, data);
  return updatedExpense;
};

const deleteExpense = async (expenseId) => {
  assertObjectIdString(expenseId, 'Expense id');

  let deleteExpense = await getExpense(expenseId);
  if (deleteExpense == null) {
    throw `Expense not found for expense ID(${expenseId})`;
  }

  deleteExpense.payment = await deleteExpensePayment(deleteExpense.paymentId);

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

  for (let i = 0; i < allExpenses.length; i++) {
    const del = await deleteExpensePayment(allExpenses[i].paymentId);
  }

  const collection = await getExpensesCollection();
  const { deletedCount } = await collection.deleteMany({ tripId: new ObjectId(tripId) });
  if (deletedCount === 0) {
    throw new QueryError(`Could not delete all expenses for (${tripId})`);
  }
  allExpenses.message = 'Successfully deleted all expenses.';
  return parseMongoData(allExpenses);
};

module.exports = {
  getExpense,
  getAllExpensesByTrip,
  addExpense,
  updateExpense,
  deleteAllExpensesByTrip,
  deleteExpense,
  getAllExpensesByUser,
};
