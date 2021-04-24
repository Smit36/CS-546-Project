const { Router } = require('express');
const router = Router();

const data = require('../data');
const expenseData = data.expenses;

//Add Expense of trip
router.post('/', async (req, res) => {
  try {
    const expense = req.body;
    const newExpense = await expenseData.addExpense(expense);
    res.status(200).json(newExpense);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

//Get All expenses
router.get('/trip/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    console.log(tripId);
    const allExpenses = await expenseData.getAllExpenses(tripId);
    res.status(200).json(allExpenses);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

//Get single expense by expenseId
router.get('/:expenseId', async (req, res) => {
  try {
    const { expenseId } = req.params;
    const expense = await expenseData.getExpense(expenseId);
    res.status(200).json(expense);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

//Update expense
router.put('/:expenseId', async (req, res) => {
  try {
    const { expenseId } = req.params;
    let  expense = req.body;

    expense = await expenseData.updateExpense(expenseId, expense);
    res.status(200).json(expense);
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e });
  }
});

//Delete all expenses
router.delete('/trip/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const allExpenses = await expenseData.deleteAllExpenses(tripId);
    res.status(200).json(allExpenses);
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e });
  }
});

//Delete single expense by expenseId
router.delete('/:expenseId', async (req, res) => {
  try {
    const { expenseId } = req.params;
    const expense = await expenseData.deleteExpense(expenseId);
    res.status(200).json(expense);
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e });
  }
});

module.exports = router;
