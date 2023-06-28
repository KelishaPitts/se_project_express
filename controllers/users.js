const User = require("../models/user");
const { BAD_REQUEST, NOT_FOUND, SERVER_ERROR } = require("../utils/errors");

const createUser = (req, res) => {
  console.log(req);
  console.log(req.body);

  const { name, avatar } = req.body;

  User.create({ name, avatar })
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res
          .status(BAD_REQUEST)
          .send({ message: "Invalid data passed through createUser." });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: "Server Error from createUser" });
      }
    });
};
const getUsers = (req, res) => {
  console.log(req);
  User.find({})
    .then((items) => res.send(items))
    .catch(() => {
      res.status(SERVER_ERROR).send({ message: "Server Error" });
    });
};

const getUserId = (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail()
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      if (err.name === "ValidationError" || err.name === "CastError") {
        res
          .status(BAD_REQUEST)
          .send({ message: "Invalid data passed through getUsers." });
      } else if (err.name === "DocumentNotFoundError") {
        res.status(NOT_FOUND).send({ message: "User with that Id not found." });
      } else {
        res.status(SERVER_ERROR).send({ message: "Server Error" });
      }
    });
};

module.exports = {
  createUser,
  getUsers,
  getUserId,
};
