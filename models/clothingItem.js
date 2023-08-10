const mongoose = require("mongoose");
const validator = require("validator");

const clothingItem = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30,
  },
  weather: {
    type: String,
    enum: ["hot", "warm", "cold"],
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
    validate: {
      validator: (v) => validator.isURL(v),
      message: "Please input a Url",
    },
  },

  owner: { type: mongoose.Schema.Types.ObjectId, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("clothingitem", clothingItem);
