const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  image: String,
  author: {
    name: String,
    avatar: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);
