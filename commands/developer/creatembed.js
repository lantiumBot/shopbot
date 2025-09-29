const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const Logger = require('../../utils/Logger');
const getLogChannel = require('../../utils/getLogChannel'); // Ajuste le chemin selon la structure de ton projet

module.exports = {
    name: "creatembed",
    category: "developer",
    permissions: ['DEVELOPER'],
    usage: "creatembed",
    examples: ["creatembed"],
    description: "Permet de créer un embed",
    async run(client, message) {

        const filter = (response) => response.author.id === message.author.id;

        try {
            // Ask for the title
            await message.channel.send("Quel est le titre de l'embed ?");
            const titleResponse = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
            const title = titleResponse.first().content;

            await message.channel.send("Quel est le contenu de l'embed ?");
            const contentResponse = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
            const content = contentResponse.first().content;
            if (content.length > 1024) {
                return message.channel.send("Le contenu de l'embed ne peut pas dépasser 1024 caractères.");
            }
        
            // Ask for the color
            await message.channel.send("Quelle couleur pour l'embed ? (ex: #FF5733 ou RED, GREEN, BLUE)");
            const colorResponse = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
            const colorInput = colorResponse.first().content;
            let color;
            if (colorInput.startsWith("#")) {
                color = colorInput;
            } else {
                const colorMap = {
                    RED: "#FF0000",
                    GREEN: "#00FF00",
                    BLUE: "#0000FF",
                    YELLOW: "#FFFF00",
                    PURPLE: "#800080",
                    ORANGE: "#FFA500",
                };
                color = colorMap[colorInput.toUpperCase()] || "#FFFFFF"; // Default to white if not found
            }

            // Ask for the channel
            await message.channel.send("Dans quel salon envoyer l'embed ? (mentionnez le salon ou donnez son ID)");
            const channelResponse = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
            const channelInput = channelResponse.first().content;
            const targetChannel = message.guild.channels.cache.get(channelInput.replace(/[<#>]/g, ''));

            if (!targetChannel) {
                return message.channel.send("Salon invalide. Commande annulée.");
            }

            // Create and send the embed
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(content)
                .setColor(color)
                .setTimestamp()

            await targetChannel.send({ embeds: [embed] });
            message.channel.send("Embed envoyé avec succès !");
        } catch (error) {
            console.error(error);
            message.channel.send("Temps écoulé ou une erreur est survenue. Commande annulée.");
        }

    },
};