const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const { limiter } = require("./utils/rateLimit");
const { login, createUser } = require("./controllers/users");
const {validateClothingItemBody, validateUserBody, validateLogin, validateId} = require("./middlewares/validation");
const {errors} = require("celebrate");

const {errorMiddleware,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError } = require("./middlewares/error.js");

  const{requestLogger,errorLogger}= require("./middlewares/loggers")

const { NOT_FOUND } = require("./utils/errors");
const routes = require("./routes");
//const { errorMiddleware } = require('./errorMiddleware');


const { PORT = 3001 } = process.env;

const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to the database");
  })
  .catch(() => {
    console.log("Database connection error:");
  });

app.use(express.json());
app.use(requestLogger);
app.use(cors());
app.use(limiter);
app.use(helmet());
app.post("/signin", validateLogin, login);
app.post("/signup", validateUserBody, createUser);
app.use(routes);


app.use("/", (req, res) => {
  console.log(req);
  (next(NotFoundError("Requested resource not found")))
  //res.status(NOT_FOUND).send({ message: "Requested resource not found" });
});
app.use(errorLogger);
app.use(errors());
app.use(errorMiddleware);
app.listen(PORT, () => {});
