const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const Logger = require('../../utils/Logger');
const getMessage = require('../../utils/getMessage');

module.exports = {
    name: "pourcentage",
    category: "util",
    permissions: ['SendMessages'],
    usage: "pourcentage <montant> <pourcentage>",
    examples: ["pourcentage 100 20"],
    description: "Calculer un pourcentage d'un montant",
    options: [
        {
            name: "montant",
            description: "Taper le montant en €",
            type: ApplicationCommandOptionType.Number,
            required: true,
        },
        {
            name: "pourcentage",
            description: "Taper le pourcentage",
            type: ApplicationCommandOptionType.Number,
            required: true,
        },
        {
            name: "lang",
            description: "Langue : fr ou en",
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: "Français", value: "fr" },
                { name: "English", value: "en" },
            ],
            required: false,
        },
    ],
    async runInteraction(client, interaction) {
        // Priorité : option → locale
        const lang = interaction.options.getString('lang') || (interaction.locale && interaction.locale.startsWith('fr') ? 'fr' : 'en');

        const amount = interaction.options.getNumber('montant');
        const percentage = interaction.options.getNumber('pourcentage');
        const fee = parseFloat((amount * percentage / 100).toFixed(2));
        const rendu = parseFloat((amount - fee).toFixed(2));

        const embed = new EmbedBuilder()
            .setTitle(getMessage("percentEmbedTitle", lang))
            .addFields(
                { name: getMessage("percentEmbedAmount", lang), value: `${amount}€`, inline: true },
                { name: getMessage("percentEmbedPercent", lang), value: `${percentage}%`, inline: true },
                { name: getMessage("percentEmbedFee", lang), value: `${fee}€`, inline: true },
                { name: getMessage("percentEmbedReceive", lang), value: `${rendu}€`, inline: true }
            )
            .setColor('Blurple')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
