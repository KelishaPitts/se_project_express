const router = require("express").Router();
const user = require("./users");
const clothingItem = require("./clothingItems");
const { NOT_FOUND } = require("../utils/errors");

router.use("/items", clothingItem);
router.use("/users", user);
router.use((req, res) => {
  console.log(req);
  res.status(NOT_FOUND).send({ message: "Router not found" });
});

module.exports = router;
