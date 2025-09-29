const { EmbedBuilder } = require("discord.js");
const RepData = require("../../models/rep");
const LeaderboardData = require("../../models/leaderboard"); // Nouveau modèle
const { LEADERBOARD_CHANNEL_ID } = require('../../ids');

async function updateLeaderboard(client) {
    try {
        // Récupérer le salon
        const channel = await client.channels.fetch(LEADERBOARD_CHANNEL_ID);
        if (!channel) {
            console.error(`[ERROR] Salon non trouvé : ${LEADERBOARD_CHANNEL_ID}`);
            return;
        }

        // Récupérer les vendeurs triés par rep
        const sellers = await RepData.find().sort({ rep: -1 }).limit(10); // Limité au top 10

        if (!sellers || sellers.length === 0) {
            console.info("[INFO] Aucun vendeur trouvé pour le classement.");
            return;
        }

        // Générer la description du classement
        const leaderboardDescription = sellers
            .map((seller, index) => {
                const medal = index === 0 ? "<:001:1384850057442103380>" : index === 1 ? "<:002:1384850161330819173>" : index === 2 ? "<:003:1384850169895583754>" : `${index + 1}️⃣`;
                const displayName = seller.username === "yubikeyxdev" ? "Old" : seller.username;
                return `${medal} **${displayName}** : ${seller.rep} Rep`;
            })
            .join("\n");

        const embed = new EmbedBuilder()
            .setTitle("🥛 Sellers Leaderboard")
            .setDescription(leaderboardDescription + `\n\nTotal de rep: ${sellers.reduce((acc, seller) => acc + seller.rep, 0)}`)
            .setColor("White")
            .setFooter({ text: "Mis à jour automatiquement" })
            .setTimestamp();

        // Récupérer ou créer le message de classement
        const leaderboardData = await LeaderboardData.findOne({ channelId: LEADERBOARD_CHANNEL_ID });
        let leaderboardMessage;

        if (leaderboardData) {
            // Récupérer le message existant
            leaderboardMessage = await channel.messages.fetch(leaderboardData.messageId).catch(() => null);
        }

        if (leaderboardMessage) {
            // Mettre à jour le message existant
            await leaderboardMessage.edit({ embeds: [embed] });
            console.info("[INFO] Classement mis à jour avec succès.");
        } else {
            // Créer un nouveau message si aucun n'existe
            const newMessage = await channel.send({ embeds: [embed] });

            // Enregistrer le message dans la DB
            await LeaderboardData.create({
                messageId: newMessage.id,
                channelId: LEADERBOARD_CHANNEL_ID,
            });

            console.info("[INFO] Nouveau classement créé avec succès.");
        }
    } catch (error) {
        console.error(`[ERROR] Erreur lors de la mise à jour du leaderboard : ${error.message}`);
    }
}

module.exports = updateLeaderboard;
