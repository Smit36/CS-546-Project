const express = require("express");

const { applyMiddleware } = require("./middleware");
const { configRoutes } = require("./routes");

const app = express().use("/", express.static(`${__dirname}/public`));
app.use(express.json());

//applyMiddleware(app);

configRoutes(app);

module.exports = app;
