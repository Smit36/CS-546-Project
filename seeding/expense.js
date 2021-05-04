const { ObjectId } = require('mongodb');
const { addExpense } = require('../data/expenses');

const seedExpense = async () => {
  const userId1 = new ObjectId();
  const tripId1 = new ObjectId();
  const userId2 = new ObjectId();
  const tripId2 = new ObjectId();

  const expenseData1 = {
    userId: userId1,
    tripId: tripId1,
    name: 'EWR to JFK',
    description: 'Travel',
    amount: 120,
    currency: '$',
    notes: 'Flight tickets',
    method: 'Card',
    date: '04/21/2021',
  };

  const expenseData2 = {
    userId: userId1,
    tripId: tripId1,
    name: 'Ramada Hotel',
    description: 'Accomodation',
    amount: 90,
    currency: '$',
    notes: 'Hotel rent',
    method: 'Card',
    date: '04/22/2021',
  };

  const expenseData3 = {
    userId: userId1,
    tripId: tripId1,
    name: 'Taxi',
    description: 'Travel from hotel to office',
    amount: 20,
    currency: '$',
    notes: 'Taxi rent',
    method: 'Card',
    date: '04/23/2021',
  };

  const expenseData4 = {
    userId: userId2,
    tripId: tripId2,
    name: 'USA to India',
    description: 'Air India airline',
    amount: 1200,
    currency: '$',
    notes: 'Flight tickets',
    method: 'Card',
    date: '02/01/2021',
  };

  const expenseData5 = {
    userId: userId2,
    tripId: tripId2,
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
