const { ObjectId, ObjectID } = require('mongodb');
const { expensePayment: getExpensePaymentsCollection } = require('../config/mongoCollections');
const { getExpense } = require('./expenses');

const { QueryError, ValidationError } = require('../utils/errors');
const { idQuery, parseMongoData, stringifyObjectId } = require('../utils/mongodb');
const {
  assertObjectIdString,
  assertIsValuedString,
  assertRequiredObject,
  assertDateString,
  assertRequiredNumber,
} = require('../utils/assertion');

const getByObjectId = async (objectId) => {
  const collection = await getExpensePaymentsCollection();
  const expensePayment = await collection.findOne(idQuery(objectId));
  return parseMongoData(expensePayment);
};

const addExpensePayment = async (data) => {
  assertRequiredObject(data);

  const { expenseId, paymentId, amount, currency, notes, method, date } = data;
  const createdAt = new Date().getTime();

  assertObjectIdString(expenseId, 'Expense id');
  assertDateString(date, 'Expense payment date');
  assertRequiredNumber(amount, 'Expense amount');
  assertIsValuedString(currency, 'Expense curreny');
  assertIsValuedString(method, 'Payment method');

  const expensePaymentData = {
    _id: new ObjectId(paymentId),
    expenseId: new ObjectId(expenseId),
    amount,
    currency,
    notes,
    method,
    date,
    createdAt,
    updatedAt: createdAt,
  };

  const collection = await getExpensePaymentsCollection();

  const payment = await collection.find({ expenseId: new ObjectId(expenseId) }).toArray();
  if (payment.length != 0) {
    throw new QueryError(`Payment already exist for expense ID(${expenseId})`);
  }

  const { result, insertedCount, insertedId } = await collection.insertOne(expensePaymentData);

  if (!result.ok || insertedCount !== 1) {
    throw new QueryError(`Could not add expense payment for expense ID(${expenseId})`);
  }

  return await getByObjectId(insertedId);
};

const deleteExpensePayment = async (paymentId) => {
  assertObjectIdString(paymentId, 'Payment Id');

  let deleteExpensePayment = await getByObjectId(paymentId);
  if (deleteExpensePayment == null) {
    throw new QueryError(`Payment not found for payment ID(${paymentId})`);
  }

  const collection = await getExpensePaymentsCollection();
  let { deletedCount } = await collection.deleteOne({
    _id: new ObjectId(paymentId),
  });

  if (deletedCount === 0) {
    throw new QueryError(`Could not delete payment for (${paymentId})`);
  }

  return parseMongoData(deleteExpensePayment);
};

const updateExpensePayment = async (paymentId, data) => {
  assertRequiredObject(data);
  const { expenseId, amount, currency, notes, method, date } = data;

  assertObjectIdString(expenseId, 'Expense id');
  assertDateString(date, 'Expense payment time');
  assertRequiredNumber(amount, 'Expense amount');
  assertIsValuedString(currency, 'Expense curreny');
  assertIsValuedString(method, 'Payment method');

 

  const lastExpensePayment = await getExpensePayment(paymentId);
  if (lastExpensePayment == null) {
    throw new QueryError(`Payment not found for payment ID(${paymentId})`);
  }

  const newUpdate = {
    expenseId: new ObjectId(expenseId),
    amount,
    currency,
    notes,
    method,
    date,
    updatedAt: new Date().getTime(),
  };

  const collection = await getExpensePaymentsCollection();
  const { modifiedCount, matchedCount } = await collection.updateOne(
    { _id: new ObjectId(paymentId) },
    { $set: newUpdate },
  );

  if (!modifiedCount && !matchedCount) {
    throw new QueryError(`Could not update payment ID(${paymentId})`);
  }
  const updatedExpensePayment = await getByObjectId(paymentId);
  return updatedExpensePayment;
};

const getExpensePayment = async (paymentId) => {
  assertObjectIdString(paymentId, 'Expense payment id');

  let expensePayment = await getByObjectId(paymentId);
  if (expensePayment == null) {
    throw new QueryError(`Could not get expense payment for (${paymentId})`);
  }
  return expensePayment;
};

module.exports = {
  getExpensePayment,
  addExpensePayment,
  updateExpensePayment,
  deleteExpensePayment,
};
