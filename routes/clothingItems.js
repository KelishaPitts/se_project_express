const router = require("express").Router();
const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");
const {
  validateClothingItemBody,
  validateId,
} = require("../middlewares/validation");
const { auth } = require("../middlewares/auth");

router.get("/", getItems);
router.post("/", auth, validateClothingItemBody, createItem);
router.delete("/:itemId", auth, validateId, deleteItem);
router.put("/:itemId/likes", auth, validateId, likeItem);
router.delete("/:itemId/likes", auth, validateId, dislikeItem);

module.exports = router;
