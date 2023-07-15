const router = require("express").Router();
const user = require("./users");
const clothingItem = require("./clothingItems");
const { NOT_FOUND} = require("../utils/errors");
const {auth} = require("../middlewares/auth")



router.use("/items", auth, clothingItem);
router.use("/users", auth, user);
router.use((req, res) => {
  console.log(req);
  res.status(NOT_FOUND).send({ message: "Router not found" });
});

module.exports = router;
