const { defaultErrorHandling } = require("../middleware");
const landingPageRouter = require("./landing");
const expensesRouter = require("./expenses");
const tripRouter = require("./trips");
const approvalRouter = require("./approvals");
const usersRouter = require("./users");
const rankRouter = require("./ranks");
const corporateRouter = require("./corporate");

const configRoutes = (app) =>
  app
    .use("/", landingPageRouter)
    .use("/expense", expensesRouter)
    .use("/trip", tripRouter)
    .use("/approval", approvalRouter)
    .use("/user", usersRouter)
    .use("/rank", rankRouter)
    .use("/corporate", corporateRouter)
    .use(defaultErrorHandling);

module.exports = {
  configRoutes,
};
