const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3001 } = process.env;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/wtwr_db'),
  (r) => {
    console.log('connect to database');
  },
  (err) => console.log('database error', err);

app.use((req, res, next) => {
  req.user = {
    _id: '5d8b8592978f8bd833ca8133',
  };
  next();
  module.exports.createClothingItem = (req, res) => {
    console.log(req.user._id);
  };
});

const routes = require('./routes');
app.use(express.json());
app.use(routes);

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
  console.log('It is alive!!!');
});
