const { ApplicationCommandOptionType, EmbedBuilder, Discord } = require("discord.js");

module.exports = {
    name: "create",
    category: "admin",
    permissions: ["Administrator"],
    usage: "create <emoji>",
    examples: ["create ✅"],
    description: "Permet d'ajouter des emojis sur le serveur",
    async run(client, message, args) {

        const emojiRegex = /<a?:[a-zA-Z0-9_]+:(\d+)>/;
        const totalEmojis = args.length;
        let creeemojis = 0;
        for (const rawEmoji of args) {
            const emojiss = rawEmoji.match(emojiRegex);

            if (emojiss) {
                const emojiId = emojiss[1];
                const extension = rawEmoji.startsWith("<a:") ? ".gif" : ".png";
                const url = `https://cdn.discordapp.com/emojis/${emojiId + extension}`;

                message.guild.emojis.create({ attachment: url, name: emojiId })
                    .then(async (emoji) => {
                        creeemojis++;
                        if (creeemojis === totalEmojis) {
                            message.channel.send(`${creeemojis} émoji${creeemojis !== 1 ? "s" : ""} créer avec succès`);
                        }
                    })
                    .catch(async (error) => {
                        message.channel.send(`Erreur lors de la création de l'émoji: ${error}`);
                    });
            }
        }
    }
};