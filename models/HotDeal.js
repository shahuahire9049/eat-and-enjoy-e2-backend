const mongoose = require('mongoose');

const HotDealSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  image: String,
});

module.exports = mongoose.model('HotDeal', HotDealSchema);
