const router = require("express").Router();
const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");
const {validateClothingItemBody, validateUserBody, validateLogin, validateId} = require("../middlewares/validation");
const { auth } = require("../middlewares/auth");

router.get("/", getItems);
router.use(auth);
router.post("/", validateClothingItemBody, auth, createItem);
router.delete("/:itemId", validateId, auth, deleteItem);
router.put("/:itemId/likes", validateId, auth, likeItem);
router.delete("/:itemId/likes", validateId, auth, dislikeItem);

module.exports = router;
