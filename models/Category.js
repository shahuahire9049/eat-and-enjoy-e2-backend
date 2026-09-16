const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  image: String
});

module.exports = mongoose.model('Category', CategorySchema);
