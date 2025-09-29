const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const Logger = require('../../utils/Logger');
const getLogChannel = require('../../utils/getLogChannel'); // Ajuste le chemin selon la structure de ton projet

module.exports = {
    name: "pic",
    category: "util",
    permissions: ['SendMessages'],
    usage: "pic [user]",
    examples: ["pic"],
    description: "Permet d'afficher la photo de profil d'un utilisateur",
    options: [
        {
            name: "user",
            description: "Choisissez un utilisateur",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],
    async run(client, message, args) {

        // récupère l'utilisateur, si aucun n'est spécifié, prend l'utilisateur qui a tapé la commande, sinon prend le premier utilisateur mentionné ou son id si c'est un nombre
        const user = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
        const avatar = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const embed = new EmbedBuilder()
            .setTitle(user.username)
            .setImage(avatar)
            .setColor("White")

        message.channel.send({ embeds: [embed] });

    },
};