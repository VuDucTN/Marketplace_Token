// business.model.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema for Business
let Product = new Schema({
  name: {
    type: String,
  },
  price: {
    type: Number,
  },
  image: {
    type: String,
  },
});

module.exports = mongoose.model("Product", Product);
