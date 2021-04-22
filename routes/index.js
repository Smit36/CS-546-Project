const { defaultErrorHandling } = require("../middleware");
const landingPageRouter = require("./landing");

const configRoutes = (app) =>
  app
    .use("/", landingPageRouter)
    .use(defaultErrorHandling);

module.exports = {
  configRoutes,
};
