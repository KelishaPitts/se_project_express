const router = require("express").Router();
const user = require("./users");
const clothingItem = require("./clothingItems");
const { NOT_FOUND} = require("../utils/errors");
const {auth} = require("../middlewares/auth")



router.use("/items", auth, clothingItem);
router.use("/users", auth, user);


module.exports = router;
