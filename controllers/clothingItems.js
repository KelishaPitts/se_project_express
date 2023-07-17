const ClothingItem = require("../models/clothingItem");
const { BAD_REQUEST, NOT_FOUND, SERVER_ERROR, FORBIDDEN } = require("../utils/errors");
const user = require("../models/user");


const createItem = (req, res) => {
  console.log(req);
  console.log(req.body);

  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({
    name,
    weather,
    imageUrl,
    owner: req.user._id
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
  ClothingItem.findById(itemId)
    .orFail()
    .then((item) =>{
    if(String(item.owner) !== req.user._id){
      console.log(item.owner)
      res.status(FORBIDDEN).send({message : `You are not authorized to delete this item. ${item.owner}`})
    }
    return item.deleteOne().then(()=>{
      res.send({ message: "You disliked an item." })
    })})
    .catch((err) => {
      console.log(err)
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

//64b4bc0e8a61f94707d0d73a
const likeItem = (req, res) =>{
  const  {itemId}  = req.params
    ClothingItem.findByIdAndUpdate(
      { _id: itemId},
    { $push: { likes: req.user._id} }
    )
    .orFail()
    .then((likes) => {
      if(String(likes.owner) == ( req.user._id))

      return res.send({ message: "You liked an item." });
    })
    .catch((err) => {
      console.log(err + `${itemId}`)
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
  }



const dislikeItem = (req, res) =>{
  const { itemId } = req.params
  ClothingItem.findByIdAndUpdate(
    {_id: itemId},
    {$pull: {likes: req.user._id}}
  )
    .orFail()
    .then((likes) => {
      if(String(likes.owner) == req.user._id){
      return item.deleteOne().then(()=>{
      res.send({ message: "You disliked an item." });
      }
    )}})
    .catch((err) => {
      console.log(err.name)
      if (err.name === "ValidationError" || err.name === "CastError") {
        res.status(BAD_REQUEST).send({ message: "Invalid Id." });
      } else if (err.name === "DocumentNotFoundError") {
        res.status(NOT_FOUND).send({ message: "Id not found." });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: "Server Error from dislikedItem" });
      }
    });}

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
