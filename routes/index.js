const router = require("express").Router();
const user = require("./users");
const clothingItem = require("./clothingItems");

router.use("/users", user);
router.use("/items", clothingItem);

module.exports = router;
