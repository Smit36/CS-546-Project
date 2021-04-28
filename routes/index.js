const { defaultErrorHandling } = require("../middleware");
const landingPageRouter = require("./landing");
const expensesRouter = require("./expenses");
const expensePaymentRouter = require("./expensePayments");
const tripRouter = require("./trips");
const approvalRouter = require("./approvals");

const configRoutes = (app) =>
  app
    .use("/", landingPageRouter)
    .use("/expense", expensesRouter)
    .use("/payment", expensePaymentRouter)
    .use("/trip", tripRouter)
    .use("/approval", approvalRouter)
    .use(defaultErrorHandling);

module.exports = {
  configRoutes,
};
