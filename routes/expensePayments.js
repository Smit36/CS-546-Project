const { Router } = require('express');
const router = Router();

const paymentData = require('../data/expensePayments');

//Add Expense Payment
router.post('/', async (req, res) => {
  try {
    const expensePayment = req.body;
    const newExpense = await paymentData.addExpensePayment(expensePayment);
    res.status(200).json(newExpense);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

//Get Expense Payment
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await paymentData.getExpensePayment(paymentId);
    res.status(200).json(payment);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

//Update Expense Payment
router.put('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    let expensePayment = req.body;

    updatedPayment = await paymentData.updateExpensePayment(paymentId, expensePayment);
    res.status(200).json(updatedPayment);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

//Delete Expense Payment
router.delete('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const expensePayment = await paymentData.deleteExpensePayment(paymentId);
    res.status(200).json(expensePayment);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

module.exports = router;
