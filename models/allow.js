const mongoose = require('mongoose');

const allowSchema = mongoose.Schema({
  id: String,
  roleID: String,
});

module.exports = mongoose.model('Allow', allowSchema);