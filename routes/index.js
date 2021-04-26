//const app = require('../app');
const { defaultErrorHandling } = require('../middleware');
const landingPageRouter = require('./landing');
const expensesRouter = require('./expenses');
const expensePaymentRouter = require('./expensePayments');

const configRoutes = (app) => {
  app.use('/', landingPageRouter).use(defaultErrorHandling);
  app.use('/expense', expensesRouter).use(defaultErrorHandling);
  app.use('/payment', expensePaymentRouter).use(defaultErrorHandling);
};

module.exports = {
  configRoutes,
};
