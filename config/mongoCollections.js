const { getCollection } = require('./mongoConnection');

const EXPENSE_COLLECTION_NAME = 'expenses';
const EXPENSE_PAYMENTS_COLLECTION_NAME = 'expense_payments';
const APPROVAL_COLLECTION_NAME = 'approvals';
const CORPORATE_COLLECTION_NAME = 'corporates';
const TRIP_COLLECTION_NAME = 'trips';

module.exports = {
  expenses: () => getCollection(EXPENSE_COLLECTION_NAME),
  expensePayment: () => getCollection(EXPENSE_PAYMENTS_COLLECTION_NAME),
  approvals: () => getCollection(APPROVAL_COLLECTION_NAME),
  corporates: () => getCollection(CORPORATE_COLLECTION_NAME),
  trips: () => getCollection(TRIP_COLLECTION_NAME),
};
