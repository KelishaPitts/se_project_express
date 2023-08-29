const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");
const { BadRequestError } = require("../error_classes/BadRequestError");
const { UnauthorizedError } = require("../error_classes/UnauthorizedError");
const { NotFoundError } = require("../error_classes/NotFoundError");
const { ConflictError } = require("../error_classes/ConflictError");

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) =>
      res.send({
        token: jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" }),
      })
    )
    .catch(() => {
      next(new UnauthorizedError("Login failed"));
    });
};

function createUser(req, res, next) {
  console.log(req);
  console.log(req.body);
  const { name, avatar, email, password } = req.body;
  if (!email) {
    next(new BadRequestError("Enter Email."));
  }

  return User.findOne({ email })
    .then((currentUser) => {
      if (currentUser) {
        return next(new ConflictError("User already exists."));
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
            next(
              new BadRequestError("Invalid data passed through createUser.")
            );
          }
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
}

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail()
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      if (err.name === "ValidationError" || err.name === "CastError") {
        next(new BadRequestError("Invalid data passed through getCurrentUser"));
      } else if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("User with that ID not found."));
      } else {
        next(err);
      }
    });
};

const updateProfile = (req, res, next) => {
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
        next(
          new BadRequestError("Invalid data passed through get Update Profile.")
        );
      } else if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("User with that Id not found."));
      } else {
        next(err);
      }
    });
};

module.exports = {
  login,
  createUser,
  getCurrentUser,
  updateProfile,
};
