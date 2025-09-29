const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const SaleData = require("../../models/sale");
const RepData = require("../../models/rep");
const getMessage = require("../../utils/getMessage");

module.exports = {
    name: "restorevouch",
    category: "developer",
    permissions: ["DEVELOPER"],
    usage: "restorevouch <channel>",
    examples: ["restorevouch #vouch"],
    description: "Restaure les vouch dans le salon spécifié.",
    options: [
        {
            name: "channel",
            description: "Le salon où restaurer les vouch.",
            type: ApplicationCommandOptionType.Channel,
            required: true,
        },
    ],
    async runInteraction(client, interaction) {
        const channel = interaction.options.getChannel("channel");

        if (!channel.isTextBased()) {
            return interaction.reply({
                content: "❌ Le canal spécifié n'est pas un canal textuel.",
                ephemeral: true,
            });
        }

        try {
            const sales = await SaleData.find().catch((err) => {
                console.error(`Erreur lors de la récupération des ventes : ${err.message}`);
                return null;
            });

            if (!sales || sales.length === 0) {
                return interaction.reply({
                    content: "❌ Aucun vouch trouvé dans la base de données.",
                    ephemeral: true,
                });
            }

            // Récupère toutes les réputations en une seule requête
            const repMap = await RepData.find({ userId: { $in: sales.map(sale => sale.sellerId) } })
                .then(reps => reps.reduce((map, rep) => (map[rep.userId] = rep.rep, map), {}));

            for (let i = 0; i < sales.length; i++) {
                const sale = sales[i];
                const buyer = await client.users.fetch(sale.buyerId).catch(() => null);

                if (!buyer) {
                    console.warn(`Utilisateur introuvable pour l'ID : ${sale.buyerId}`);
                    continue;
                }

                const rep = repMap[sale.sellerId] || 0;
                const stars = "⭐".repeat(sale.evaluation || 5);

                // Formatage de la date en français (jj-MM-yyyy hh:mm:ss)
                const formattedDate = new Date(sale.date).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                });

                // Utiliser l'avatar de l'utilisateur ou l'icône du serveur si indisponible
                const avatarURL = buyer.displayAvatarURL() || interaction.guild.iconURL();

                const embed = new EmbedBuilder()
                    .setTitle(`Nouvelle Vouch de ${buyer.tag}`)
                    .setColor("White")
                    .setThumbnail(avatarURL)
                    .setDescription(stars)
                    .addFields(
                        { name: "Vouch:", value: `${sale.quantity} x ${sale.itemName}`, inline: true },
                        { name: "Vendeur:", value: `<@${sale.sellerId}>`, inline: true },
                        { name: "Prix:", value: `${sale.price} (${sale.paymentMethod})`, inline: false },
                        { name: "Numéro de vouch:", value: `${i + 1}`, inline: true }, // Numéro séquentiel
                        { name: "Vouch par:", value: `<@${buyer.id}>`, inline: true },
                        { name: "Date du vouch:", value: formattedDate, inline: true }
                    )
                    .setFooter({ text: getMessage("ShopFooter", lang) })
                    .setTimestamp();

                await channel.send({ embeds: [embed] });
            }

            interaction.reply({
                content: `✅ Les vouch ont été restaurés avec succès dans ${channel}.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error(`Erreur lors de la restauration des vouchs : ${error.stack}`);
            interaction.reply({
                content: "❌ Une erreur est survenue lors de la restauration des vouchs.",
                ephemeral: true,
            });
        }
    },
};