const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");
const {
  BAD_REQUEST,
  UNAUTHORIZED,
  NOT_FOUND,
  CONFLICT,
  SERVER_ERROR,
} = require("../utils/errors");

const login = (req, res) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) =>
      res.send({
        token: jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" }),
      })
    )
    .catch((err) => {
      console.log(err);
      return res.status(UNAUTHORIZED).send({ message: "Login failed" });
    });
};

function createUser(req, res) {
  console.log(req);
  console.log(req.body);
  const { name, avatar, email, password } = req.body;
  if (email === null || !email) {
    return res.status(BAD_REQUEST).send({ message: "Enter Email" });
  }

  return User.findOne({ email })
    .then((currentUser) => {
      if (currentUser) {
        return res.status(CONFLICT).send({ message: "User already exists." });
      }
      return bcrypt
        .hash(password, 10)
        .then((hash) =>
          User.create({
            name,
            avatar,
            email,
            password: hash,
          })
        )
        .then((user) =>
          res.send({
            data: {
              name: user.name,
              avatar: user.avatar,
              _id: user._id,
              email: user.email,
            },
          })
        )
        .catch((err) => {
          console.log(err);
          if (err.name === "ValidationError") {
            return res
              .status(BAD_REQUEST)
              .send({ message: "Invalid data passed through createUser." });
          }
          return res
            .status(SERVER_ERROR)
            .send({ message: "Server Error from createUser" });
        });
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(SERVER_ERROR)
        .send({ message: "Server Error from createUser" });
    });
}

const getCurrentUser = (req, res) => {
  User.findById(req.user._id)
    .orFail()
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      console.log(err.name);
      if (err.name === "ValidationError" || err.name === "CastError") {
        res
          .status(BAD_REQUEST)
          .send({ message: "Invalid data passed through getCurrentUser." });
      } else if (err.name === "DocumentNotFoundError") {
        res.status(NOT_FOUND).send({ message: "User with that ID not found." });
      } else {
        res.status(SERVER_ERROR).send({ message: "Server Error" });
      }
    });
};

const updateProfile = (req, res) => {
  const { name, avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { name, avatar },
    },
    { new: true, runValidators: true }
  )
    .orFail()
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      console.log(err.name);
      if (err.name === "ValidationError" || err.name === "CastError") {
        res
          .status(BAD_REQUEST)
          .send({ message: "Invalid data passed through get Update Profile." });
      } else if (err.name === "DocumentNotFoundError") {
        res.status(NOT_FOUND).send({ message: "User with that Id not found." });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: "Server Error from Update Profile" });
      }
    });
};

module.exports = {
  login,
  createUser,
  getCurrentUser,
  updateProfile,
};
