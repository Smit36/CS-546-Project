const express = require("express");

const { applyMiddleware } = require("./middleware");
const { configRoutes } = require("./routes");

const app = express().use("/", express.static(`${__dirname}/public`));

applyMiddleware(app);

configRoutes(app);

module.exports = app;