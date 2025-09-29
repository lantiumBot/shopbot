const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
    messageId: { type: String, required: true }, // ID du message d'embed
    channelId: { type: String, required: true }, // ID du salon de classement
    createdAt: { type: Date, default: Date.now }, // Date de création
});

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
