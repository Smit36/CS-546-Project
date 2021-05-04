const { defaultErrorHandling } = require("../middleware");
const landingPageRouter = require("./landing");
const expensesRouter = require("./expenses");
const usersRouter = require("./users");
const rankRouter = require("./ranks");

const configRoutes = (app) =>
  app
    .use("/", landingPageRouter)
    .use("/expense", expensesRouter)
    .use("/user", usersRouter)
    .use("/rank", rankRouter)
    .use(defaultErrorHandling);

module.exports = {
  configRoutes,
};
