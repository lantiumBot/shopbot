const Sale = require('../../models/sale'); // Modèle des ventes
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType } = require('discord.js');

module.exports = {
    name: "sales",
    category: "admin",
    permissions: ['VENDOR'],
    usage: "sales [@vendeur]",
    examples: ["sales", "sales @vendeur"],
    description: "Affiche l’historique des ventes d’un vendeur. Si aucun argument, affiche vos propres ventes.",
    async run(client, message, args) {

        const idCorrections = {
            "756338300259664012": "333314116817125376", // yubikey25
            "340957191718699038": "333314116817125376", // yubikeyxdev
            "333314116817125376": "333314116817125376", // yubiworld.
        };

        let sellerId;

        if (args.length > 0) {
            const userMention = args[0];
            sellerId = userMention.replace(/[<@!>]/g, ""); // Extraire l'ID de l'utilisateur mentionné
            const user = await message.guild.members.fetch(sellerId).catch(() => null);
            if (!user) {
                return message.reply("❌ Cet utilisateur n'est pas valide ou n'est pas dans ce serveur.");
            }
        } else {
            sellerId = idCorrections[message.author.id] || message.author.id;
        }

        try {
            const user = await client.users.fetch(sellerId).catch(() => null);
            const username = user ? user.tag : "Utilisateur inconnu";

            const sales = await Sale.find({ sellerId }).sort({ date: -1 });
            if (sales.length === 0) {
                return message.reply(`❌ Aucune vente enregistrée pour ${username}.`);
            }

            // Regrouper les ventes par jour
            const salesByDay = {};
            sales.forEach((sale) => {
                const formattedDate = new Date(sale.date).toLocaleDateString('fr-FR');
                if (!salesByDay[formattedDate]) {
                    salesByDay[formattedDate] = [];
                }
                salesByDay[formattedDate].push(sale);
            });

            const days = Object.keys(salesByDay);
            let pageIndex = 0;

            // Générer l'embed pour la page actuelle
            const generateEmbed = (index) => {
                const day = days[index];
                const salesList = salesByDay[day]
                    .map((sale) => {
                        const formattedTime = new Date(sale.date).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                        });
                        return `- **${sale.quantity}x ${sale.itemName}** • 🕒 ${formattedTime} • 💰 ${sale.price}€ via ${sale.paymentMethod} • 👤 Vendu à <@${sale.buyerId}>`;
                    })
                    .join("\n");

                const totalAmount = salesByDay[day].reduce((sum, sale) => sum + Number(sale.price), 0);

                return new EmbedBuilder()
                    .setTitle(`📊 Historique des ventes de ${username}`)
                    .setDescription(`🗓️ **Date : ${day}**\n\n${salesList}`)
                    .setColor('Blue')
                    .setFooter({ text: `Page ${index + 1} sur ${days.length}` })
                    .setTimestamp();
            };

            const getRow = (pageIndex) => new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('⬅️ Précédent')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pageIndex === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('➡️ Suivant')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pageIndex === days.length - 1),
                new ButtonBuilder()
                    .setCustomId('goto')
                    .setLabel('Aller à la page')
                    .setStyle(ButtonStyle.Secondary)
            );

            const msg = await message.reply({ embeds: [generateEmbed(pageIndex)], components: [getRow(pageIndex)] });

            const filter = (interaction) => interaction.user.id === message.author.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'next') {
                    if (pageIndex < days.length - 1) pageIndex++;
                    await interaction.update({
                        embeds: [generateEmbed(pageIndex)],
                        components: [getRow(pageIndex)],
                    });
                } else if (interaction.customId === 'previous') {
                    if (pageIndex > 0) pageIndex--;
                    await interaction.update({
                        embeds: [generateEmbed(pageIndex)],
                        components: [getRow(pageIndex)],
                    });
                } else if (interaction.customId === 'goto') {
                    // Afficher un modal pour demander le numéro de page
                    const modal = new ModalBuilder()
                        .setCustomId('goto_modal')
                        .setTitle('Aller à la page')
                        .addComponents(
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder()
                                    .setCustomId('page_number')
                                    .setLabel(`Numéro de page (1-${days.length})`)
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(true)
                            )
                        );
                    await interaction.showModal(modal);

                    // Attendre la soumission du modal
                    const modalFilter = (i) => i.customId === 'goto_modal' && i.user.id === message.author.id;
                    try {
                        const modalInteraction = await interaction.awaitModalSubmit({ filter: modalFilter, time: 15000 });
                        const pageInput = modalInteraction.fields.getTextInputValue('page_number');
                        const pageNum = parseInt(pageInput, 10);
                        if (isNaN(pageNum) || pageNum < 1 || pageNum > days.length) {
                            await modalInteraction.reply({ content: `❌ Numéro de page invalide.`, ephemeral: true });
                        } else {
                            pageIndex = pageNum - 1;
                            await modalInteraction.update({
                                embeds: [generateEmbed(pageIndex)],
                                components: [getRow(pageIndex)],
                            });
                        }
                    } catch (e) {
                        // Modal non soumis à temps
                    }
                }
            });

            collector.on('end', () => {
                msg.edit({ components: [] });
            });

        } catch (error) {
            console.error(`[ERROR] Erreur lors de la récupération des ventes :`, error);
            return message.reply("❌ Une erreur est survenue lors de la récupération des ventes.");
        }
    },
};
