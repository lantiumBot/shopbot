const Guild = require('../models/guild'); // Chemin vers ton modèle

/**
 * Récupère un salon de log à partir de la base de données.
 * @param {Guild} guild - Le serveur Discord.
 * @param {string} logType - Le type de log à récupérer.
 * @returns {TextChannel|null} - Le salon de log ou null s'il n'existe pas.
 */
async function getLogChannel(guild, logType) {
    try {
        const guildConfig = await Guild.findOne({ id: guild.id });
        if (!guildConfig) return null;

        const logChannelObj = guildConfig.logChannels.find((log) => log.key === logType);
        const logChannelId = logChannelObj ? logChannelObj.value : null;
        return logChannelId ? guild.channels.cache.get(logChannelId) : null;
    } catch (error) {
        console.error(`Erreur lors de la récupération du salon de log (${logType}) : ${error.message}`);
        return null;
    }
}

module.exports = getLogChannel;
