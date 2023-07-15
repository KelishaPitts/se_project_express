require('dotenv').config();
console.log(process.env.NODE_ENV);

const { JWT_SECRET } = process.env;

module.exports = JWT_SECRET;