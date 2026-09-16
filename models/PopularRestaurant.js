const mongoose = require('mongoose');

const PopularRestaurantSchema = new mongoose.Schema({
  name: String,
  slug: String,
  image: String,
  rating: Number,
  openingHours: String,
  address: String
});

module.exports = mongoose.model('PopularRestaurant', PopularRestaurantSchema);
