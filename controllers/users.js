const User = require("../models/user");
const {
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
  SERVER_ERROR,
} = require("../utils/errors");

const createUser = (req, res) => {
  console.log(req);
  console.log(req.body);

  const { name, avatar } = req.body;

  User.create({ name, avatar })
    .then((item) => {
      console.log(item);
      res.send({ data: item });
    })
    .catch((err) => {
      res
        .status(BAD_REQUEST)
        .send({ message: "Invalid data passed through createUser.", err });
    });
};
const getUsers = (req, res) => {
  User.find({})
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      res.status(SERVER_ERROR).send({ message: "Server Error", err });
    });
};

const getUserId = (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail()
    .then((item) => res.status(200).send({ data: item }))
    .catch((err) => {
      if (err.name === "ValidationError" || err.name === "CastError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: "Invalid data passed through getUsers.", err });
      } else if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND)
          .send({ message: "User with that Id not found.", err });
      } else {
        return res.status(SERVER_ERROR).send({ message: "Server Error", err });
      }
    });
};

module.exports = {
  createUser,
  getUsers,
  getUserId,
};
