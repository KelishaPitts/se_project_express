const ClothingItem = require('../models/clothingItem');
const {
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
  SERVER_ERROR,
} = require('../utils/errors');

const createItem = (req, res) => {
  console.log(req);
  console.log(req.body);

  const { name, weather, imageUrl, likes, createAt } = req.body;

  ClothingItem.create({
    name,
    weather,
    imageUrl,
    owner: req.user._id,
    likes,
    createAt,
  })
    .then((item) => {
      console.log(item);
      res.send({ data: item });
    })
    .catch((err) => {
      res
        .status(BAD_REQUEST)
        .send({ message: 'Invald data passed into create ClothingItem', err });
    });
};
const getItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      res
        .status(SERVER_ERROR)
        .send({ message: 'Server Error from getItems', err });
    });
};

const updateItem = (req, res) => {
  const { itemId } = req.params;
  const { imageUrl } = req.body;

  ClothingItem.findByIdAndUpdate(itemId, { $set: { imageUrl } })
    .orFail()
    .then((item) => res.status(200).send({ data: item }))
    .catch((err) => {
      res
        .status(SERVER_ERROR)
        .send({ message: 'Server Error from UpdateItem', err });
    });
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  ClothingItem.findByIdAndDelete(itemId)
    .orFail()
    .then((item) => res.status(200).send({}))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Invalid Item Id.' });
      } else if (err.name === 'DocumentNotFoundError') {
        return res
          .status(NOT_FOUND)
          .send({ message: 'Item with that Id not found.', err });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: 'Server Error from deleteItem' });
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
      res.send({ message: 'You liked an item.' });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Invalid Id.' });
      } else if (err.name === 'DocumentNotFoundError') {
        return res.status(NOT_FOUND).send({ message: 'Id not found.', err });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: 'Server Error from likeItem' });
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
      res.send({ message: 'You disliked an item.' });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Invalid Id.' });
      } else if (err.name === 'DocumentNotFoundError') {
        return res.status(NOT_FOUND).send({ message: 'Id not found.', err });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: 'Server Error from dislikedItem' });
      }
    });

module.exports = {
  createItem,
  getItems,
  updateItem,
  deleteItem,
  likeItem,
  dislikeItem,
};
