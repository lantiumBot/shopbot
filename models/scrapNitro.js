const mongoose = require("mongoose");

const scrapNitroSchema = new mongoose.Schema({
    messageId: { type: String, required: true }, // ID du message d'embed
    channelId: { type: String, required: true }, // ID du salon de classement
    createdAt: { type: Date, default: Date.now }, // Date de création
});

module.exports = mongoose.model("ScrapNitro", scrapNitroSchema);
