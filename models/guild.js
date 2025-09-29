const mongoose = require("mongoose");

const guildSchema = mongoose.Schema({
  id: String,
  allowedRoles: [String],
  prefix: { type: String, default: "!" },
});

module.exports = mongoose.model("Guild", guildSchema);
