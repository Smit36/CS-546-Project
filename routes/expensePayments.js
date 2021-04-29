const { Router } = require('express');
const router = Router();

const paymentData = require('../data/expensePayments');

//Add Expense Payment
router.post('/', async (req, res, next) => {
  try {
    const expensePayment = req.body;
    const newExpense = await paymentData.addExpensePayment(expensePayment);
    res.status(200).json(newExpense);
  } catch (error) {
    next(error);
  }
});

//Get Expense Payment
router.get('/:paymentId', async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const payment = await paymentData.getExpensePayment(paymentId);
    res.status(200).json(payment);
  } catch (error) {
    next(error);
  }
});

//Update Expense Payment
router.put('/:paymentId', async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    let expensePayment = req.body;

    updatedPayment = await paymentData.updateExpensePayment(paymentId, expensePayment);
    res.status(200).json(updatedPayment);
  } catch (error) {
    next(error);
  }
});

//Delete Expense Payment
router.delete('/:paymentId', async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const expensePayment = await paymentData.deleteExpensePayment(paymentId);
    res.status(200).json(expensePayment);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
