const express = require("express");
const session = require("express-session");
const exphbs = require("express-handlebars");
const {
  AxiosError,
  HttpError,
  QueryError,
  ValidationError,
} = require("../utils/errors");

const applyMiddleware = (app) =>
  app
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(
      session({
        name: "AuthCookie",
        secret: "some secret string!",
        resave: false,
        saveUninitialized: true,
      })
    )
    .engine("handlebars", exphbs({ defaultLayout: "main" }))
    .set("view engine", "handlebars");

const defaultErrorHandling = (error, req, res, next) => {
  if (
    error instanceof AxiosError ||
    error instanceof HttpError ||
    error instanceof QueryError ||
    error instanceof ValidationError
  ) {
    console.error(error);
    const { message, status = 400, data = {} } = error;
    res.status(status).json({ ...data, message });
  } else {
    next(error);
  }
};

module.exports = {
  applyMiddleware,
  defaultErrorHandling,
};
