const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const { errors } = require("celebrate");
const { limiter } = require("./utils/rateLimit");
const { login, createUser } = require("./controllers/users");
const { validateUserBody, validateLogin } = require("./middlewares/validation");
const { errorMiddleware } = require("./middlewares/error");
const { NotFoundError } = require("./error_classes/NotFoundError");
const { requestLogger, errorLogger } = require("./middlewares/loggers");
const routes = require("./routes");

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

app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

app.post("/signin", validateLogin, login);
app.post("/signup", validateUserBody, createUser);
app.use(routes);

app.use("/", (req, res, next) => {
  console.log(req);
  console.log(res);
  next(new NotFoundError("Requested resource not found"));
});
app.use(errorLogger);
app.use(errors());
app.use(errorMiddleware);
app.listen(PORT, () => {});
