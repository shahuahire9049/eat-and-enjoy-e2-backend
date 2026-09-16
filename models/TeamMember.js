const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
  name: String,
  role: String,
  image: String,
});

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
