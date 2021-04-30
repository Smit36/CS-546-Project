const { defaultErrorHandling } = require("../middleware");
const landingPageRouter = require("./landing");
const corporatePageRouter = require("./corporate");

const configRoutes = (app) =>
  app
    .use("/", landingPageRouter)
    .use("/corporate", corporatePageRouter)
    .use(defaultErrorHandling);

module.exports = {
  configRoutes,
};
