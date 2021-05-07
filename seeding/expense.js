const { ObjectId } = require('mongodb');
const { addExpense } = require('../data/expenses');
const { stringifyObjectId } = require('../utils/mongodb');

const seedExpense = async ({
  user1Id = new ObjectId(),
  user2Id = new ObjectId(),
  trip1Id = new ObjectId(),
  trip2Id = new ObjectId(),
} = {}) => {
  const expenseData1 = {
    userId: stringifyObjectId(user1Id),
    tripId: stringifyObjectId(trip1Id),
    name: 'EWR to JFK',
    description: 'Travel',
    amount: 120,
    currency: '$',
    notes: 'Flight tickets',
    method: 'Card',
    date: '04/21/2021',
  };

  const expenseData2 = {
    userId: stringifyObjectId(user1Id),
    tripId: stringifyObjectId(trip1Id),
    name: 'Ramada Hotel',
    description: 'Accomodation',
    amount: 90,
    currency: '$',
    notes: 'Hotel rent',
    method: 'Card',
    date: '04/22/2021',
  };

  const expenseData3 = {
    userId: stringifyObjectId(user1Id),
    tripId: stringifyObjectId(trip1Id),
    name: 'Taxi',
    description: 'Travel from hotel to office',
    amount: 20,
    currency: '$',
    notes: 'Taxi rent',
    method: 'Card',
    date: '04/23/2021',
  };

  const expenseData4 = {
    userId: stringifyObjectId(user2Id),
    tripId: stringifyObjectId(trip2Id),
    name: 'USA to India',
    description: 'Air India airline',
    amount: 1200,
    currency: '$',
    notes: 'Flight tickets',
    method: 'Card',
    date: '02/01/2021',
  };

  const expenseData5 = {
    userId: stringifyObjectId(user2Id),
    tripId: stringifyObjectId(trip2Id),
    name: 'Taxi',
    description: 'Airport to Office',
    amount: 3,
    currency: '$',
    notes: 'Taxi Rent',
    method: 'Cash',
    date: '02/03/2021',
  };
  const expense1 = addExpense(expenseData1);
  const expense2 = addExpense(expenseData2);
  const expense3 = addExpense(expenseData3);
  const expense4 = addExpense(expenseData4);
  const expense5 = addExpense(expenseData5);

  return {
    expense1,
    expense2,
    expense3,
    expense4,
    expense5,
  };
};

module.exports = seedExpense;
