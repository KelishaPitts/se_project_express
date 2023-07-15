const bcrypt = require("bcrypt");
const token = require("../utils/config");
const { JWT_SECRET } = require("../utils/config");

const {
  BAD_REQUEST,
  UNAUTHORIZED,
  NOT_FOUND,
  CONFLICT,
  SERVER_ERROR,
} = require("../utils/errors");

const login = (req, res) => {
  const { email, password } = req.body;
  if (!password) {
    return res.status(UNAUTHORIZED).send({ message: "Enter Password" });
  }
  if (!email) {
    return res.status(UNAUTHORIZED).send({ message: "Enter Email" });
  }
  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        return res.status(401).send({ message: "Login failed" });
      }
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch(() => {
      res.status(UNAUTHORIZED).send({ message: "Logon failed" });
    });
};

const createUser = (req, res) => {
  console.log(req);
  console.log(req.body);
  const { name, avatar, email, password } = req.body;

  if (!password) {
    return res.status(UNAUTHORIZED).send({ message: "Enter Password" });
  }
  if (!email) {
    return res.status(UNAUTHORIZED).send({ message: "Enter Email" });
  }
  if (31 > name.length < 2) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Name must be at least 2 characters long" });
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
          res.send({ name, avatar, _id: user._id, email: user.email });
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

const getCurrentUser = (req, res) => {
  User.findById(req.user._id)
    .orFail()
    .then((item) => res.send({ data: item }))
    .catch((err) => {
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
