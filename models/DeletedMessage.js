// models/DeletedMessage.js
const mongoose = require('mongoose');

const DeletedMessageSchema = new mongoose.Schema({
    messageId: { type: String, required: true, unique: true },
    content: { type: String, default: "" },
    authorTag: { type: String, default: "Inconnu" },
    authorId: { type: String, required: true },
    channelId: { type: String, required: true },
    executor: { type: String, default: "Inconnu" },
    timestamp: { type: Number, default: Date.now }
});

module.exports = mongoose.model('DeletedMessage', DeletedMessageSchema);
