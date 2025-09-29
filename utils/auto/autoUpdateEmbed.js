// handlers/autoUpdateEmbed.js
const { EmbedBuilder } = require('discord.js');
const scrapeAccount = require('../../auto/scrapAccount/index'); // Premier scraper
const scrapeFuji = require('../../auto/scrapNitro/fuji'); // Deuxième scraper
const scapeameryShoper = require('../../auto/scrapNitro/ameryshoper'); // Troisième scraper
const getMessage = require('../../utils/getMessage');
// Configuration des messages et salons (remplacez par vos IDs réels)
const EMBEDS_CONFIG = [
    {
        messageId: '', // ID du premier message à mettre à jour
        channelId: '1365382235674382527', // ID du salon du premier message
        scraper: scrapeAccount, // Fonction de scraping associée
        title: '🟢 Live Stock',
        color: '#00FF00',
        formatData: (data) => {
            return data.map(({ year, stock }) => ({
                name: `Année ${year}`,
                value: `Stock : ${stock}`,
                inline: true,
            }));
        },
    },
    {
        messageId: '', // ID du deuxième message à mettre à jour
        channelId: '1370004544767000646', // ID du salon du deuxième message
        scraper: scapeameryShoper, // Fonction de scraping associée
        title: '🟢 Live Stock',
        color: '#00FFFF',
        formatData: (data) => {
            return data.map(({ name, availability, price }) => ({
                name: `Nitro Boost 1 mois`,
                value: `Quantité : ${availability}\nPrix : 3.50€`,
                inline: true,
            }));
        },
    },
];

module.exports = async (client) => {
    try {
        console.log(`${EMBEDS_CONFIG.length} embed(s) configuré(s). Lancement de la mise à jour automatique.`);


        // Lancer la mise à jour périodique pour chaque embed configuré
        EMBEDS_CONFIG.forEach((config) => {
            setInterval(async () => {
                try {
                    const channel = client.channels.cache.get(config.channelId);
                    if (!channel) {
                        console.error(`Canal non trouvé pour l'ID ${config.channelId}.`);
                        return;
                    }

                    // Récupérer le message à mettre à jour
                    const message = await channel.messages.fetch(config.messageId);
                    if (!message) {
                        console.error(`Message non trouvé pour l'ID ${config.messageId}.`);
                        return;
                    }

                    // Récupérer les nouvelles données via le scraper associé
                    const results = await config.scraper();

                    // Formater les données selon le type d'embed
                    const formattedFields = config.formatData(results);

                    // Construire un nouvel embed avec les données récupérées
                    const updatedEmbed = new EmbedBuilder()
                        .setTitle(config.title)
                        .setColor(config.color)
                        .addFields(formattedFields)
                        .setFooter({ text: getMessage("ShopFooter", lang) })
                        .setTimestamp();

                    // Mettre à jour le message avec le nouvel embed
                    await message.edit({ embeds: [updatedEmbed] });
                } catch (error) {
                    console.error(`Erreur lors de la mise à jour de l'embed pour le canal ${config.channelId} :`, error.message);
                }
            }, 5 * 60 * 1000); // Mise à jour toutes les 60 secondes
        });
    } catch (error) {
        console.error("Erreur lors de la configuration des mises à jour automatiques :", error.message);
    }
};