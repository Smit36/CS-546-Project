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
    amount: 1200,
    currency: '€',
    notes: 'Flight tickets',
    method: 'card',
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
    method: 'card',
    date: '04/22/2021',
  };

  const expenseData3 = {
    userId: stringifyObjectId(user1Id),
    tripId: stringifyObjectId(trip1Id),
    name: 'Taxi',
    description: 'Travel from hotel to office',
    amount: 2000,
    currency: '₹',
    notes: 'Taxi rent',
    method: 'card',
    date: '04/23/2021',
  };

  const expenseData4 = {
    userId: stringifyObjectId(user2Id),
    tripId: stringifyObjectId(trip2Id),
    name: 'USA to India',
    description: 'Air India airline',
    amount: 300,
    currency: '$',
    notes: 'Flight tickets',
    method: 'card',
    date: '02/01/2021',
  };

  const expenseData5 = {
    userId: stringifyObjectId(user2Id),
    tripId: stringifyObjectId(trip2Id),
    name: 'Taxi',
    description: 'Airport to Office',
    amount: 30,
    currency: '€',
    notes: 'Taxi Rent',
    method: 'Cash',
    date: '02/03/2021',
  };
  const expense1 = await addExpense(expenseData1);
  const expense2 = await addExpense(expenseData2);
  const expense3 = await addExpense(expenseData3);
  const expense4 = await addExpense(expenseData4);
  const expense5 = await addExpense(expenseData5);

  return {
    expense1,
    expense2,
    expense3,
    expense4,
    expense5,
  };
};

module.exports = seedExpense;
