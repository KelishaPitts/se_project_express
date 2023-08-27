const router = require("express").Router();
const { getCurrentUser, updateProfile } = require("../controllers/users");
const { auth } = require("../middlewares/auth");
const {validateClothingItemBody, validateUserBody, validateLogin, validateId} = require("../middlewares/validation");

router.use(auth);
router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, updateProfile);

module.exports = router;
