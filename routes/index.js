const { defaultErrorHandling } = require("../middleware");
const landingPageRouter = require("./landing");
const expensesRouter = require("./expenses");
const expensePaymentRouter = require("./expensePayments");

const configRoutes = (app) =>
  app
    .use("/", landingPageRouter)
    .use("/expense", expensesRouter)
    .use("/payment", expensePaymentRouter)
    .use(defaultErrorHandling);

module.exports = {
  configRoutes,
};
