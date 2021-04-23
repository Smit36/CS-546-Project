const { getCollection } = require('./mongoConnection');

const EXPENSE_COLLECTION_NAME = 'expenses';

module.exports = {
  expenses: () => getCollection(EXPENSE_COLLECTION_NAME),
};
