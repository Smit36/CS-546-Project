const { Router } = require('express');
const router = Router();

const expenseData = require('../data/expenses');

//Add Expense of trip
router.post('/', async (req, res, next) => {
  try {
    const expense = req.body;
    const newExpense = await expenseData.addExpense(expense);
    res.status(200).json(newExpense);
  } catch (error) {
    next(error);
  }
});

//Get All expenses
router.get('/trip/:tripId', async (req, res, next) => {
  try {
    const { tripId } = req.params;

    const allExpenses = await expenseData.getAllExpensesByTrip(tripId);
    res.status(200).json(allExpenses);
  } catch (error) {
    next(error);
  }
});

//Get single expense by expenseId
router.get('/:expenseId', async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    const expense = await expenseData.getExpense(expenseId);
    res.status(200).json(expense);
  } catch (error) {
    next(error);
  }
});

//Update expense
router.put('/:expenseId', async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    let expense = req.body;
    expense = await expenseData.updateExpense(expenseId, expense);
    res.status(200).json(expense);
  } catch (error) {
    next(error);
  }
});

//Delete all expenses
router.delete('/trip/:tripId', async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const allExpenses = await expenseData.deleteAllExpensesByTrip(tripId);
    res.status(200).json(allExpenses);
  } catch (error) {
    next(error);
  }
});

//Delete single expense by expenseId
router.delete('/:expenseId', async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    const expense = await expenseData.deleteExpense(expenseId);
    res.status(200).json(expense);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
