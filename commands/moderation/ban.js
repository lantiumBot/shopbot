const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const Logger = require('../../utils/Logger');
const getLogChannel = require('../../utils/getLogChannel'); // Ajuste le chemin selon la structure de ton projet

module.exports = {
    name: "ban",
    category: "moderation",
    permissions: ['BanMembers'],
    usage: "ban [membre] [raison]",
    examples: ["ban @membre spam"],
    description: "Permet de bannir un membre du serveur",
    options: [
        {
            name: "user",
            description: "Membre à bannir",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "reason",
            description: "Raison du bannissement",
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    async run(client, message, args) {

        // commande ban, mais le user et la raison sont obligatoire ! via les args

        const user = message.mentions.users.first();
        const reason = args.slice(1).join(' ');

        if (!user) {
            return message.reply("Veuillez mentionner un utilisateur à bannir.");
        }

        if (user.id === message.author.id) {
            return message.reply("Vous ne pouvez pas vous bannir vous-même.");
        }

        if (!reason) {
            return message.reply("Veuillez fournir une raison pour le bannissement.");
        }

        const member = message.guild.members.cache.get(user.id);

        if (member) {
            member
                .ban({ reason: reason })
                .then(async () => {
                    const embed = new EmbedBuilder()
                        .setTitle("Membre banni")
                        .setDescription(`**<@${user.id}>** a été banni du serveur.`)
                        .addField("Raison", reason)
                        .setColor("Red")
                        .setTimestamp();

                    await message.channel.send({ 
                        embeds: [embed],
                        stickers: client.guilds.cache.get('1329053992130445363').stickers.cache.filter(s => s.id === '1329586331046772776')
                    });

                    const logChannel = await getLogChannel(message.guild, 'banLogs');
                    if (logChannel) {
                        logChannel.send({ embeds: [embed] });
                    }

                })
                .catch((error) => {
                    Logger.error(error);
                    message.reply("Une erreur est survenue lors du bannissement de ce membre.");
                });
        } else {
            message.reply("Ce membre n'est pas sur le serveur.");
        }

    },
    async runInteraction(client, interaction) {

        const logChannel = await getLogChannel(guild, 'decoVoc');

    },
};