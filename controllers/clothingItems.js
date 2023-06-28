const ClothingItem = require("../models/clothingItem");
const { BAD_REQUEST, NOT_FOUND, SERVER_ERROR } = require("../utils/errors");

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
        res
          .status(BAD_REQUEST)
          .send({ message: "Invald data passed into create ClothingItem" });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: "Server Error from create ClothingItem" });
      }
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
  ClothingItem.findByIdAndDelete(itemId)
    .orFail()
    .then(() => res.send({ message: "You deleted an item." }))
    .catch((err) => {
      if (err.name === "ValidationError" || err.name === "CastError") {
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
const likeItem = (req, res) =>
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } }, // add _id to the array if it's not there yet
    { new: true }
  )
    .orFail()
    .then(() => {
      res.send({ message: "You liked an item." });
    })
    .catch((err) => {
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
const dislikeItem = (req, res) =>
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } }, // remove _id from the array
    { new: true }
  )
    .orFail()
    .then(() => {
      res.send({ message: "You disliked an item." });
    })
    .catch((err) => {
      if (err.name === "ValidationError" || err.name === "CastError") {
        res.status(BAD_REQUEST).send({ message: "Invalid Id." });
      } else if (err.name === "DocumentNotFoundError") {
        res.status(NOT_FOUND).send({ message: "Id not found." });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: "Server Error from dislikedItem" });
      }
    });

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
