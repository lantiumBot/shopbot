const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const Logger = require('../../utils/Logger');

module.exports = {
    name: "editembed",
    category: "developer",
    permissions: ['DEVELOPER'],
    usage: "editembed",
    examples: ["editembed"],
    description: "Modifier un embed existant",
    options: [
        {
            name: "id_du_message",
            description: "ID du message contenant l'embed à modifier",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "champ",
            description: "Nom du champ à modifier (ex: Vouch:, Prix:, etc.)",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "nouvelle_valeur",
            description: "Nouvelle valeur pour le champ sélectionné",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    async runInteraction(client, interaction) {
        const messageId = interaction.options.getString("id_du_message");
        const fieldToEdit = interaction.options.getString("champ");
        const newValue = interaction.options.getString("nouvelle_valeur");

        try {
            // Récupérer le message par son ID
            const message = await interaction.channel.messages.fetch(messageId);
            if (!message) {
                return interaction.reply({ content: "Message introuvable.", ephemeral: true });
            }

            // Vérifier si le message contient un embed
            if (!message.embeds.length) {
                return interaction.reply({ content: "Ce message ne contient pas d'embed.", ephemeral: true });
            }

            // Créer une copie mutable de l'embed existant
            const embed = EmbedBuilder.from(message.embeds[0]);

            // Trouver le champ à modifier
            const fields = embed.data.fields || [];
            const fieldIndex = fields.findIndex(field => field.name === fieldToEdit);

            if (fieldIndex === -1) {
                return interaction.reply({ content: `Le champ "${fieldToEdit}" n'existe pas dans cet embed.`, ephemeral: true });
            }

            // Mettre à jour la valeur du champ
            fields[fieldIndex].value = newValue;

            // Appliquer les modifications
            embed.setFields(fields);

            // Modifier le message avec le nouvel embed
            await message.edit({ embeds: [embed] });

            // Répondre à l'utilisateur
            interaction.reply({ content: `La valeur du champ "${fieldToEdit}" a été mise à jour avec succès.`, ephemeral: true });
        } catch (error) {
            Logger.error(error);
            interaction.reply({ content: "Une erreur s'est produite lors de la modification de l'embed.", ephemeral: true });
        }
    },
};