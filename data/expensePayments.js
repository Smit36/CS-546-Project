const { ObjectId, ObjectID } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const expensePaymentsCollection = await expensePayments();

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
  const expensePayment = await expensePaymentsCollection.findOne(idQuery(objectId));
  return parseMongoData(expensePayment);
};

const addExpensePayment = async (data) => {
  assertRequiredObject(data);

  const { expenseId, amount, currency, notes, method, time } = data;
  const createdAt = new Date().getTime();

  assertObjectIdString(expenseId, 'Expense id');
  assertDateString(time, 'Expense payment time');
  assertRequiredNumber(currency, 'Currency of expense amount');
  assertIsValuedString(method, 'Payment method');

  const expensePaymentData = {
    _id: new ObjectId(),
    expenseId: new ObjectId(expenseId),
    amount,
    currency,
    notes,
    method,
    time,
    createdAt,
    updatedAt: createdAt,
  };

  const { result, insertedCount, insertedId } = await expensePaymentsCollection.insertOne(
    expensePaymentData,
  );

  if (!result.ok || insertedCount !== 1) {
    throw new QueryError(`Could not add expense payment for expense ID(${expenseId})`);
  }

  return await getByObjectId(insertedId);
};

const deleteExpensePayment = async (paymentId) => {
  assertObjectIdString(paymentId, 'Payment Id');

  let deleteExpensePayment = await getByObjectId(new ObjectId(paymentId));
  if (deleteExpensePayment == null) {
    throw new QueryError(`Payment not found for payment ID(${paymentId})`);
  }

  let { deletedCount } = await expensePaymentsCollection.deleteOne({
    _id: new ObjectId(paymentId),
  });

  if (deletedCount === 0) {
    throw new QueryError(`Could not delete payment for (${paymentId})`);
  }

  deleteExpensePayment.message = 'Successfully deleted';
  return deleteExpensePayment;
};

const updateExpensePayment = async (paymentId, data) => {
  assertRequiredObject(data);
  const { expenseId, amount, currency, notes, method, time } = data;

  assertObjectIdString(expenseId, 'Expense id');
  assertDateString(time, 'Expense payment time');
  assertRequiredNumber(currency, 'Currency of expense amount');
  assertIsValuedString(method, 'Payment method');

  if (lastExpensePayment == null) {
    throw new QueryError(`Payment not found for payment ID(${paymentId})`);
  }

  const newUpdate = {
    expenseId: new ObjectId(expenseId),
    amount,
    currency,
    notes,
    method,
    time,
    updatedAt: new Date.getTime(),
  };

  const { modifiedCount, matchedCount } = await expensePaymentsCollection.updateOne(
    { _id: new ObjectId(payementId) },
    { $set: newUpdate },
  );

  if (!modifiedCount && !matchedCount) {
    throw new QueryError(`Could not update payment ID(${paymentId})`);
  }
  const updatedExpensePayment = await getByObjectId(new ObjectId(paymentId));
  return updatedExpensePayment;
};

const getExpensePayment = async (paymentId) => {
  assertObjectIdString(paymentId, 'Expense payment id');

  let expensePayment = await getByObjectId(new ObjectId(paymentId));
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
