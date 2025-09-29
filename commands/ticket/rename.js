const { STAFF_ROLE_ID } = require("../../ids");

module.exports = {
    name: "rename",
    category: "ticket",
    permissions: ["SendMessages"],
    usage: "+rename <nom>",
    examples: ["+rename commande-special"],
    description: "Renomme le ticket actuel.",

    async run(client, message, args) {

        // si le user n'a pas le rôle 1369999016267350108 return
        if (!message.member.roles.cache.has(STAFF_ROLE_ID)) {
            message.delete();
            return;
        }

        if (!message.channel.topic || !message.channel.topic.startsWith("Ticket ouvert par")) {
            return message.reply("❌ Cette commande doit être utilisée dans un ticket.");
        }

        if (args.length === 0) {
            return message.reply("❌ Merci de fournir un nouveau nom pour le ticket.");
        }


        let newName = args.join(" ");
        if (newName.length > 32) {
            return message.reply("❌ Le nom du ticket ne peut pas dépasser 32 caractères.");
        }

        if (!message.channel.permissionsFor(client.user).has("ManageChannels")) {
            return message.reply("❌ Je n'ai pas la permission de renommer ce salon.");
        }
        try {
            await message.channel.setName(`${newName}`);
            // supprimer le message de l'utilisateur après 5 secondes

            message.delete();
            return message.reply(`✅ Le ticket a été renommé en \`${newName}\`.`).then((msg) => {
                setTimeout(() => msg.delete(), 5000);
            });
        } catch (error) {
            if (error.code === 50013) {
                console.error("Le bot n'a pas la permission de renommer le salon.");
            } else if (error.code === 50035) {
                console.error("Le nom du salon est invalide ou dépasse la limite.");
            } else {
                console.error(`Erreur inattendue : ${error.message}`);
            }
            return message.reply("❌ Impossible de renommer le ticket pour le moment. Réessaie plus tard.");
        }

    },
};
