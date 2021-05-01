const express = require("express");

const { applyMiddleware } = require("./middleware");
const { configRoutes } = require("./routes");
const seed = require("./seeding");

const app = express().use("/", express.static(`${__dirname}/public`));

applyMiddleware(app);

configRoutes(app);

seed();

module.exports = app;
