const mongoose = require('mongoose');

const LockedChannelSchema = new mongoose.Schema({
    channelId: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    defaultPermissions: [
        {
            id: { type: String, required: true },
            allow: { type: [String], required: true },
            deny: { type: [String], required: true },
        },
    ],
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LockedChannel', LockedChannelSchema);
