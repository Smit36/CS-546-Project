//const app = require('../app');
const { defaultErrorHandling } = require('../middleware');
const landingPageRouter = require('./landing');
const expensesRouter = require('./expenses');

const configRoutes = (app) => {
  app.use('/', landingPageRouter).use(defaultErrorHandling);
  app.use('/expense', expensesRouter).use(defaultErrorHandling);
};

module.exports = {
  configRoutes,
};
