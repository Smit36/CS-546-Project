const express = require("express");
const session = require("express-session");
const exphbs = require("express-handlebars");
const {
  AxiosError,
  HttpError,
  QueryError,
  ValidationError,
} = require("../utils/errors");

const LOGIN_PATH = "/user/login";
const authenticationGuard = (req, res, next) => {
  if (req.path.startsWith(LOGIN_PATH) || req.path.startsWith(`/user/logout`)) {
    return next();
  }

  const { user } = req.session;
  if (!user) {
    res.redirect(LOGIN_PATH);
  } else return next();
  return next();
};

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
    .use(authenticationGuard)
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
  authenticationGuard,
};
