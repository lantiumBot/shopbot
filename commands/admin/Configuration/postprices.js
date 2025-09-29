const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const priceMessages = require("../../../utils/handlers/priceMessages");
const Logger = require('../../../utils/Logger');

module.exports = {
    name: "postprices",
    category: "admin",
    permissions: ['OWNERS'],
    usage: "postprices",
    examples: ["postprices"],
    description: "Poste le panneau avec les 9 boutons de prix",
    async runInteraction(client, interaction) {
        const meta = priceMessages.getButtonsMeta();

        // 9 boutons → 5 par ligne max → 2 lignes (5 + 4)
        const row1 = new ActionRowBuilder();
        const row2 = new ActionRowBuilder();

        meta.slice(0, 5).forEach(btn =>
            row1.addComponents(
                new ButtonBuilder()
                    .setCustomId(btn.id)
                    .setLabel(btn.label)
                    .setEmoji(btn.emoji)
                    .setStyle(ButtonStyle[btn.style] || ButtonStyle.Primary)
            )
        );

        meta.slice(5).forEach(btn =>
            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId(btn.id)
                    .setLabel(btn.label)
                    .setEmoji(btn.emoji)
                    .setStyle(ButtonStyle[btn.style] || ButtonStyle.Primary)
            )
        );

        await interaction.channel.send({ content: "# PRIX / PRICES\n\n", components: [row1, row2] });
        await interaction.reply({ content: "Panneau de prix posté !", ephemeral: true });
    },
};