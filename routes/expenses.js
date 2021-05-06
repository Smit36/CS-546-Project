const { Router } = require('express');
const { getTemplateData } = require('../utils/routes');

const router = Router();

const expenseData = require('../data/expenses');

const {
  assertObjectIdString, 
  assertIsValuedString,
  assertDateString,
  assertRequiredNumber,
} = require('../utils/assertion');

const { HttpError } = require('../utils/errors');

const assertExpenseData = (expenseData) => {
  assertObjectIdString(expenseData.userId, 'User ID');
  assertObjectIdString(expenseData.tripId, 'Trip ID');
  assertIsValuedString(expenseData.name, 'Expense name');
  assertDateString(expenseData.date, 'Payment date');
  assertRequiredNumber(expenseData.amount, 'Expense amount');
  assertIsValuedString(expenseData.currency, 'Expense curreny');
  assertIsValuedString(expenseData.method, 'Payment method');
};

const EXPENSE_PAGE_PATH = 'expense/index';
const EXPENSE_PAGE_TITLE = 'Expense';
router.get('/', async (req, res) => {
  res.render(EXPENSE_PAGE_PATH, getTemplateData(req, { title: EXPENSE_PAGE_TITLE }));
});

//Add Expense of trip
router.post('/', async (req, res, next) => {
  try {
    const expense = req.body;
    assertExpenseData(expense);
    const newExpense = await expenseData.addExpense(expense);
    if (!newExpense) {
      throw new HttpError(`Could not add new expense`);
    }
    res.status(200).json(newExpense);
  } catch (error) {
    next(error);
  }
});

//Get All expenses
router.get('/trip/:tripId', async (req, res, next) => {
  try {
    const { tripId } = req.params;
    assertObjectIdString(tripId);
    const allExpenses = await expenseData.getAllExpensesByTrip(tripId);
    if (!allExpenses) {
      throw new HttpError(`Expense not found with provided trip id: ${tripId}`, 404);
    }
    return res.status(200).json(allExpenses);
  } catch (error) {
    next(error);
  }
});

//Get single expense by expenseId
router.get('/:expenseId', async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    assertObjectIdString(expenseId);
    const expense = await expenseData.getExpense(expenseId);
    if (!expense) {
      throw new HttpError(`Expense not found for expense id:${expenseId}`, 404);
    }
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
    assertObjectIdString(expenseId);
    assertExpenseData(expense);
    expense = await expenseData.updateExpense(expenseId, expense);
    if (!expense) {
      throw new HttpError(`Could not update expense for id:${expenseId}`, 404);
    }
    res.status(200).json(expense);
  } catch (error) {
    next(error);
  }
});

//Delete all expenses
router.delete('/trip/:tripId', async (req, res, next) => {
  try {
    const { tripId } = req.params;
    assertObjectIdString(tripId);
    const allExpenses = await expenseData.deleteAllExpensesByTrip(tripId);
    if (!allExpenses) {
      throw new HttpError(`Could not delete all expenses for trip id:${tripId}`, 404);
    }
    res.status(200).json(allExpenses);
  } catch (error) {
    next(error);
  }
});

//Delete single expense by expenseId
router.delete('/:expenseId', async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    assertObjectIdString(expenseId);
    const expense = await expenseData.deleteExpense(expenseId);
    if (!expense) {
      throw new HttpError(`Could not delete expense for id:${expenseId}`, 404);
    }
    res.status(200).json(expense);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
