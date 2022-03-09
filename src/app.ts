import createError, { HttpError } from "http-errors";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import knexConnection from "./database/db";
import { config } from "dotenv";

import usersRouter from "./routes/users";

const app = express();

config();

knexConnection
  .select(1 + 1)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => {
    console.log(e);
    console.log("unable to Connect");
  });

// view engine setup
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/users", usersRouter);

app.use("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("API ___🔥___ is up and running  🚀");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // next(createError(404));
  res.status(404).json({
    status: "Not Found",
    message: `${req.method} - ${req.originalUrl} not found`,
  });
});

// error handler
app.use(function (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
