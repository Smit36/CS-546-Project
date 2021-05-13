const { getCollection } = require("./mongoConnection");

const EXPENSE_COLLECTION_NAME = 'expenses';
const EXPENSE_PAYMENTS_COLLECTION_NAME = 'expense_payments';

module.exports = {
  expenses: () => getCollection(EXPENSE_COLLECTION_NAME),
  expensePayment: () => getCollection(EXPENSE_PAYMENTS_COLLECTION_NAME),
};
