const { STAFF_ROLE_ID } = require("../../ids");

module.exports = {
    name: "add",
    category: "ticket",
    permissions: ["SendMessages"],
    usage: "+add <@user>",
    examples: ["+add @user"],
    description: "Ajoute un utilisateur au ticket.",

    async run(client, message, args) {

        // si le user n'a pas le rôle 1369999016267350108 return
        if (!message.member.roles.cache.has(STAFF_ROLE_ID)) {
            message.delete();
            return;
        }

        if (!message.channel.topic || !message.channel.topic.startsWith("Ticket ouvert par")) {
            return message.reply("❌ Cette commande doit être utilisée dans un ticket.");
        }

        const member = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
        if (!member) {
            return message.reply("❌ Merci de mentionner un utilisateur valide ou fournir un ID valide.");
        }

        try {
            await message.channel.permissionOverwrites.create(member, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
            });
            message.reply(`✅ L'utilisateur ${member.user.tag} a été ajouté au ticket.`);
        } catch (error) {
            console.error(`[ERROR] Erreur lors de l'ajout de l'utilisateur : ${error.message}`);
            message.reply("❌ Impossible d'ajouter l'utilisateur.");
        }
    },
};
