const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const Logger = require('../../utils/Logger');

module.exports = {
    name: "clear",
    category: "moderation",
    permissions: ["ManageMessages"], // Permissions nécessaires pour exécuter la commande
    usage: "clear [nombre]; clear @membre; clear",
    examples: ["clear 50", "clear @membre", "clear"],
    description: "Supprime des messages récents dans un salon ou d'un membre (max 15 jours)",
    options: [
        {
            name: "nombre",
            description: "Nombre de messages à supprimer (max 100 par batch)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
        {
            name: "membre",
            description: "Supprime uniquement les messages d'un membre spécifique",
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],
    async run(client, message, args) {

        const member = message.mentions.members.first();
        const amount = parseInt(args[0]);

        try {
            if (member) {
                // Mode 3 : Supprime tous les messages d'un membre spécifique (max 2 semaines)
                const messages = await message.channel.messages.fetch({ limit: 100 });
                const userMessages = messages.filter(
                    (msg) => msg.author.id === member.id && (Date.now() - msg.createdTimestamp) < 1209600000
                );
                await message.channel.bulkDelete(userMessages, true);
                Logger.event(`Messages récents de ${member.user.tag} supprimés par ${message.author.tag}`);
                // return message.channel.send(`✅ Tous les messages récents de ${member.user.tag} (max 2 semaines) ont été supprimés.`)
                //     .then((msg) => setTimeout(() => msg.delete(), 5000));

                return message.channel.send({  // Utilisation d'un sticker pour la réponse 
                    stickers: ['Clean!'] // Replace 'sticker_id_here' with the actual sticker ID
                });

            }

            if (amount) {
                // Mode 2 : Supprime un certain nombre de messages (max 2 semaines)
                if (isNaN(amount) || amount < 1) {
                    return message.reply("Veuillez spécifier un nombre valide de messages à supprimer.");
                }

                let deletedCount = 0;
                while (deletedCount < amount) {
                    const batchSize = Math.min(100, amount - deletedCount); // Discord ne supprime que 100 messages à la fois
                    const messages = await message.channel.messages.fetch({ limit: batchSize });
                    const recentMessages = messages.filter(
                        (msg) => (Date.now() - msg.createdTimestamp) < 1209600000
                    );
                    if (recentMessages.size === 0) break; // Plus de messages éligibles à supprimer
                    await message.channel.bulkDelete(recentMessages, true);
                    deletedCount += recentMessages.size;
                }

                Logger.event(`${amount} messages récents supprimés par ${message.author.tag}`);
                // return message.channel.send(`✅ ${deletedCount}/${amount} messages récents ont été supprimés.`)
                //     .then((msg) => setTimeout(() => msg.delete(), 5000));

                return message.channel.send({  // Utilisation d'un sticker pour la réponse 
                    content: "C'est good !",
                    stickers: client.guilds.cache.get('1329053992130445363').stickers.cache.filter(s => s.id === '1329586331046772776') // Replace 'sticker_id_here' with the actual sticker ID
                });
            }

            // Mode 1 : Supprime tous les messages récents dans le salon (max 2 semaines)
            const messages = await message.channel.messages.fetch({ limit: 100 });
            const recentMessages = messages.filter(
                (msg) => (Date.now() - msg.createdTimestamp) < 1209600000
            );
            if (recentMessages.size > 0) {
                await message.channel.bulkDelete(recentMessages, true);
                Logger.event(`Tous les messages récents dans #${message.channel.name} supprimés par ${message.author.tag}`);
                // return message.channel.send(`✅ Tous les messages récents (max 2 semaines) ont été supprimés.`)
                //     .then((msg) => setTimeout(() => msg.delete(), 5000));

                return message.channel.send({  // Utilisation d'un sticker pour la réponse 
                    stickers: ['Clean!'] // Replace 'sticker_id_here' with the actual sticker ID
                });

            } else {
                // Aucun message éligible à la suppression
                return message.channel.send(
                    "Je ne peux pas supprimer des messages datant de plus de 2 semaines.\n"
                ).then((msg) => setTimeout(() => msg.delete(), 10000));
            }
        } catch (error) {
            Logger.error(`Erreur lors de l'exécution de la commande clear : ${error.message}`);
            return message.channel.send("Une erreur est survenue en essayant de supprimer les messages.");
        }
    },
    async runInteraction(client, interaction) {
        const member = interaction.options.getUser('membre');
        const amount = interaction.options.getInteger('nombre');

        try {
            if (member) {
                // Même logique que le Mode 3 (voir ci-dessus)
                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                const userMessages = messages.filter(
                    (msg) => msg.author.id === member.id && (Date.now() - msg.createdTimestamp) < 1209600000
                );
                await interaction.channel.bulkDelete(userMessages, true);
                Logger.event(`Messages récents de ${member.tag} supprimés par ${interaction.user.tag}`);
                return interaction.reply(`✅ Tous les messages récents de ${member.tag} (max 2 semaines) ont été supprimés.`);
            }

            if (amount) {
                // Même logique que le Mode 2 (voir ci-dessus)
                let deletedCount = 0;
                while (deletedCount < amount) {
                    const batchSize = Math.min(100, amount - deletedCount);
                    const messages = await interaction.channel.messages.fetch({ limit: batchSize });
                    const recentMessages = messages.filter(
                        (msg) => (Date.now() - msg.createdTimestamp) < 1209600000
                    );
                    if (recentMessages.size === 0) break;
                    await interaction.channel.bulkDelete(recentMessages, true);
                    deletedCount += recentMessages.size;
                }

                Logger.event(`${amount} messages récents supprimés par ${interaction.user.tag}`);
                return interaction.reply(`✅ ${deletedCount}/${amount} messages récents ont été supprimés.`);
            }

            // Même logique que le Mode 1 (voir ci-dessus)
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            const recentMessages = messages.filter(
                (msg) => (Date.now() - msg.createdTimestamp) < 1209600000
            );
            if (recentMessages.size > 0) {
                await interaction.channel.bulkDelete(recentMessages, true);
                Logger.event(`Tous les messages récents dans #${interaction.channel.name} supprimés par ${interaction.user.tag}`);
                return interaction.reply(`✅ Tous les messages récents (max 2 semaines) ont été supprimés.`);
            } else {
                return interaction.reply(
                    "Je ne peux pas supprimer des messages datant de plus de 2 semaines.\n" +
                    "Vous pouvez utiliser la commande `+renew` pour recréer le salon sans aucun message."
                );
            }
        } catch (error) {
            Logger.error(`Erreur lors de l'exécution de la commande clear (interaction) : ${error.message}`);
            return interaction.reply("Une erreur est survenue en essayant de supprimer les messages.");
        }
    },
};
