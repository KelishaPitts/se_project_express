const ClothingItem = require("../models/clothingItem");
const {
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  FORBIDDEN,
} = require("../utils/errors");

const createItem = (req, res) => {
  console.log(req);
  console.log(req.body);

  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({
    name,
    weather,
    imageUrl,
    owner: req.user._id,
  })
    .then((item) => {
      console.log(item);
      res.send({ data: item });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: "Invald data passed into create ClothingItem" });
      }
      return res
        .status(SERVER_ERROR)
        .send({ message: "Server Error from create ClothingItem" });
    });
};
const getItems = (req, res) => {
  console.log(req);
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch(() => {
      res.status(SERVER_ERROR).send({ message: "Server Error from getItems" });
    });
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  ClothingItem.findById({ _id: itemId })
    .orFail()
    .then((item) => {
      if (String(item.owner) !== req.user._id) {
        console.log(`owner ${item.owner}`);
        console.log(`owner ${req}`);
        console.log(`user ${req.user._id}`);
        return res
          .status(FORBIDDEN)
          .send({ message: `You are not authorized to delete this item.` });
      }
      return item.deleteOne().then(() => {
        res.send({ message: "Item deleted successfully." });
      });
    })
    .catch((err) => {
      console.log(err);
      if (err.name === "CastError") {
        res.status(BAD_REQUEST).send({ message: "Invalid Item Id." });
      } else if (err.name === "DocumentNotFoundError") {
        res.status(NOT_FOUND).send({ message: "Item with that Id not found." });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: "Server Error from deleteItem" });
      }
    });
};

const likeItem = (req, res) => {
  const { itemId } = req.params;
  ClothingItem.findByIdAndUpdate(
    { _id: itemId },
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((likes) => {
      if (String(likes.owner) === req.user._id) {
        return res.send({ message: "You liked an item." });
      }
      return res.send({ message: "You already liked this item." });
    })
    .catch((err) => {
      console.log(err);
      if (err.name === "ValidationError" || err.name === "CastError") {
        res.status(BAD_REQUEST).send({ message: "Invalid Id." });
      } else if (err.name === "DocumentNotFoundError") {
        res.status(NOT_FOUND).send({ message: "Id not found." });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: "Server Error from likeItem" });
      }
    });
};

const dislikeItem = (req, res) => {
  const { itemId } = req.params;
  ClothingItem.findByIdAndUpdate(
    { _id: itemId },
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then(() => res.send({ message: "You disliked an item." }))
    .catch((err) => {
      console.log(err);
      if (err.name === "ValidationError" || err.name === "CastError") {
        res.status(BAD_REQUEST).send({ message: "Invalid Id." });
      } else if (err.name === "DocumentNotFoundError") {
        res.status(NOT_FOUND).send({ message: "Item not found." });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: "Server Error from dislikeItem" });
      }
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
