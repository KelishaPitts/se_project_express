const express = require("express");
const mongoose = require("mongoose");
const { limiter } = require("./utils/rateLimit");
const helmet = require("helmet");

const { PORT = 3001 } = process.env;
const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.log("Database connection error:", error);
  });
app.use(limiter);
app.use(helmet());
app.use((req, res, next) => {
  console.log(res);
  req.user = {
    _id: "5d8b8592978f8bd833ca8133",
  };
  next();
});

const routes = require("./routes");

app.use(express.json());
app.use(routes);
app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
  console.log("It is alive!!!");
});
