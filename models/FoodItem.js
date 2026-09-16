// models/FoodItem.js
const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: String,
  category: String, // e.g., "pizza", "rice", etc.
  price: Number,
  image: String
});

module.exports = mongoose.model('FoodItem', foodItemSchema);
