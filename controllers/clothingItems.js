const ClothingItem = require("../models/clothingItem");
const { BadRequestError } = require("../error_classes/BadRequestError");
const { ForbiddenError } = require("../error_classes/ForbiddenError");
const { NotFoundError } = require("../error_classes/NotFoundError");

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({
    name,
    weather,
    imageUrl,
    owner: req.user._id,
  })
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(
          new BadRequestError("Invald data passed into create ClothingItem")
        );
      }
      next(err);
    });
};
const getItems = (req, res, next) => {
  console.log(req);
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((err) => {
      next(err);
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  ClothingItem.findById({ _id: itemId })
    .orFail()
    .then((item) => {
      if (String(item.owner) !== req.user._id) {
        next(new ForbiddenError("You are not authorized to delete this item."));
      }
      return item.deleteOne().then(() => {
        res.send({ message: "Item deleted successfully." });
      });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid Item Id."));
      } else if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("Item with that Id not found."));
      } else {
        next(err);
      }
    });
};

const likeItem = (req, res, next) => {
  const { itemId } = req.params;
  ClothingItem.findByIdAndUpdate(
    { _id: itemId },
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((likes) => {
      if (String(likes.owner) === req.user._id) {
        return res.send(likes);
      }
      return res.send({ message: "You already liked this item." });
    })
    .catch((err) => {
      if (err.name === "ValidationError" || err.name === "CastError") {
        next(new BadRequestError("Invalid Id."));
      } else if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("Id not found."));
      } else {
        next(err);
      }
    });
};

const dislikeItem = (req, res, next) => {
  const { itemId } = req.params;
  ClothingItem.findByIdAndUpdate(
    { _id: itemId },
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((likes) => res.send(likes))
    .catch((err) => {
      if (err.name === "ValidationError" || err.name === "CastError") {
        next(new BadRequestError("Invalid Id."));
      } else if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("Item not found."));
      } else {
        next(err);
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
