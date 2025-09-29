const mongoose = require('mongoose');

const blacklistSchema = mongoose.Schema({
    guildId: { type: String, required: true }, // ID du serveur
    userId: { type: String, required: true }, // ID de l'utilisateur blacklisté
    channels: { type: [String], required: true }, // Liste des ID des salons affectés
    endTime: { type: Date, required: true }, // Timestamp de fin de la blacklist
    executorId: { type: String, required: true }, // ID de l'exécuteur de la commande
});

module.exports = mongoose.model('Blacklist', blacklistSchema);
