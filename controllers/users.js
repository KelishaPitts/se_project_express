const bcrypt = require("bcrypt");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");
const jwt = require('jsonwebtoken');

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
    .then((user) => {
      return res.send({ token: jwt.sign({ _id: user._id }, JWT_SECRET ,{
        expiresIn: "7d",
      })});
    })
    .catch((err) => {
      console.log(err)
      return res.status(UNAUTHORIZED).send({ message: "Login failed" });
    });
};

const createUser = (req, res) => {
  console.log(req);
  console.log(req.body);
  const { name, avatar, email, password } = req.body;

  if (password === null) {
    return res.status(BAD_REQUEST).send({ message: "Enter Password" });
  }
  if (email === null || !email) {
    return res.status(BAD_REQUEST).send({ message: "Enter Email" });
  }
  User.findOne({ email }).then((user) => {
    if (user) {
      res.status(CONFLICT).send({ message: "User already exists." });
    } else {
      bcrypt
        .hash(password, 10)
        .then((hash) => {
          return User.create({
            name,
            avatar,
            email,
            password: hash,
          });
        })
        .then((user) => {
          delete user.password
          return res.send({ name, avatar, _id: user._id, email: user.email });

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
    }
  });
};
/*
const getCurrentUser = (req, res) => {

  User.findById(req.user._id)
    .orFail()
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      console.log(err)
      if (err.name === "ValidationError" || err.name === "CastError") {
        res
          .status(BAD_REQUEST)
          .send({ message: "Invalid data passed through get Current User." });
      } else if (err.name === "DocumentNotFoundError") {
        res.status(NOT_FOUND).send({ message: "User with that Id not found." });
      } else {
        res.status(SERVER_ERROR).send({ message: "Server Error" });
      }
    });
};
*/

const getCurrentUser = (req, res) => {
  const token = req.headers.authorization;
  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const userId = decodedToken.user._id;
    console.log("id" + userId)
    User.findById(userId)
      .orFail()
      .then((item) => res.send({ data: item }))
      .catch((err) => {
        console.log("get user" + err);
        if (err.name === 'ValidationError' || err.name === 'CastError') {
          res
            .status(BAD_REQUEST)
            .send({ message: 'Invalid data passed through getCurrentUser.' });
        } else if (err.name === 'DocumentNotFoundError') {
          res.status(NOT_FOUND).send({ message: 'User with that ID not found.' });
        } else {
          res.status(SERVER_ERROR).send({ message: 'Server Error' });
        }
      });
  } catch (err) {
    res.status(UNAUTHORIZED).send({ message: 'Invalid or expired token' });
  }
};



const updateProfile = (req, res) => {
  User.findOneAndUpdate(
    { _id: req._id },
    { newProperty: newProfile },
    { new: true }
  )
    .orFail()
    .then((item) => res.status.send({ data: item }))
    .catch((err) => {
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
