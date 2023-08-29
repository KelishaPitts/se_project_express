const errorMiddleware = (err, req, res, next) => {
  console.log(req);
  console.log(next);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).send({ message });
};

module.exports = {
  errorMiddleware,
};
