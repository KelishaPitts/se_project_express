class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }

}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }

}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }

}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }

}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
  }

}

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).send({ message });
};


module.exports = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  errorMiddleware,
};
