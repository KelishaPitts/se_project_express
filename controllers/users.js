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

  if (password === null) {
    return res.status(BAD_REQUEST).send({ message: "Enter Password" });
  }
  if (email === null || !email) {
    return res.status(BAD_REQUEST).send({ message: "Enter Email" });
  }
  User.findOne({ email }).then((user) => {
    if (user) {
      return res.status(CONFLICT).send({ message: "User already exists." });
    }
       bcrypt
      .hash(password, 10)
      .then((hash) =>
        User.create({
          name,
          avatar,
          email,
          password: hash,
        })
      )
      .then((user) => {
        delete user.password;
        return res.send({
          name: user.name, avatar: user.avatar, _id: user._id ,email: user.email
        });
      })
      .catch((err) => {
        console.log(err)
        if (err.name === "ValidationError") {
          return res
            .status(BAD_REQUEST)
            .send({ message: "Invalid data passed through createUser." });
        }
        return res
          .status(SERVER_ERROR)
          .send({ message: "Server Error from createUser" });
      });
  });
}

const getCurrentUser = (req, res) => {
  const header = req.headers.authorization;

  const [bearer, token] = header.split(" ");
  console.log(bearer);
  if (!token) {
    console.log(token);
    res.status(UNAUTHORIZED).send({ message: "Invalid or expired token" });
  }
  User.findById(req.user._id)
    .orFail()
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      console.log(err.name);
      if (err.name === "ValidationError" || err.name === "CastError") {
        res
          .status(BAD_REQUEST)
          .send({ message: "Invalid data passed through getCurrentUser." });
      } else if (err.name === "invalid token") {
        res.status(UNAUTHORIZED).send({ message: "Invalid or expired token" });
      } else if (err.name === "DocumentNotFoundError") {
        res.status(NOT_FOUND).send({ message: "User with that ID not found." });
      } else {
        res.status(SERVER_ERROR).send({ message: "Server Error" });
      }
    });
};

const updateProfile = (req, res) => {
  const { name, email, password, avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, {
    $set: { name, email, password, avatar },
  })
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
