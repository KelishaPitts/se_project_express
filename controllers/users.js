const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");
const {errorMiddleware,
        BadRequestError,
        UnauthorizedError,
        ForbiddenError,
        NotFoundError,
        ConflictError } = require("../middlewares/error.js");

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) =>
      res.send({
        token: jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" }),
      })
    )
    .catch(() => {
      next(new UnauthorizedError("Login failed"))
      //console.log(err);
      //return res.status(UNAUTHORIZED).send({ message: "Login failed" });
    });
};

function createUser(req, res, next) {
  console.log(req);
  console.log(req.body);
  const { name, avatar, email, password } = req.body;
  if (!email) {
    next(new BadRequestError("Enter Email."))
    //return res.status(BAD_REQUEST).send({ message: "Enter Email" });
  }

  return User.findOne({ email })
    .then((currentUser) => {
      if (currentUser) {
        next(new ConflictError("User already exists."))
        //return res.status(CONFLICT).send({ message: "User already exists." });
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
            next(new BadRequestError("Invalid data passed through createUser."))
            //return
              //res
              //.status(BAD_REQUEST)
              //.send({ message: "Invalid data passed through createUser." });
          }
          next(err)
          //return res
            //.status(SERVER_ERROR)
            //.send({ message: "Server Error from createUser" });
        });
    })
    .catch((err) => {
      next(err);
      //return res
        //.status(SERVER_ERROR)
        //.send({ message: "Server Error from createUser" });
    });
}

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail()
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      console.log(err.name);
      if (err.name === "ValidationError" || err.name === "CastError") {
        next(new BadRequestError("Invalid data passed through getCurrentUser"))
        //res
          //.status(BAD_REQUEST)
          //.send({ message: "Invalid data passed through getCurrentUser." });
      } else if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("User with that ID not found."))
        //res.status(NOT_FOUND).send({ message: "User with that ID not found." });
      } else {
        next(err)
        //res.status(SERVER_ERROR).send({ message: "Server Error" });
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
        next(new BadRequestError("Invalid data passed through get Update Profile."))
        //res
          //.status(BAD_REQUEST)
          //.send({ message: "Invalid data passed through get Update Profile." });
      } else if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("User with that Id not found."))
        //res.status(NOT_FOUND).send({ message: "User with that Id not found." });
      } else {
        next(err)
        //res
          //.status(SERVER_ERROR)
          //.send({ message: "Server Error from Update Profile" });
      }
    });
};

module.exports = {
  login,
  createUser,
  getCurrentUser,
  updateProfile,
};
