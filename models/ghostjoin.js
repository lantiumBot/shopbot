const mongoose = require('mongoose');

const ghostJoinSchema = new mongoose.Schema({
    guildId: { type: String, required: true }, // ID unique du serveur
    roleId: { type: String, default: null },  // ID du rôle (null pour les nouveaux arrivants)
    channels: { type: [String], required: true }, // Liste des salons où pinger
}, { timestamps: true });

module.exports = mongoose.model('GhostJoin', ghostJoinSchema);
