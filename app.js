const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const { limiter } = require("./utils/rateLimit");
const {login, createUser} =  require("./controllers/users")
const { PORT = 3001 } = process.env;



const cors = require("cors");


const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to the database");
  })
  .catch(() => {
    console.log("Database connection error:");
  });


const routes = require("./routes");
app.post('/signin', login);
app.post('/signup', createUser);

app.use(limiter);
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(routes);
app.listen(PORT, () => {});
