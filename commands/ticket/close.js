const handleTicketClosure = require("../../utils/handlers/handleTicketClosure");
const { STAFF_ROLE_ID } = require("../../ids");


module.exports = {
    name: "close",
    category: "ticket",
    permissions: ["SendMessages"],
    usage: "+close",
    examples: ["+close"],
    description: "Ferme le ticket actuel.",

    async run(client, message, args) {

        // si le user n'a pas le rôle 1369999016267350108 return
        if (!message.member.roles.cache.has(STAFF_ROLE_ID)) {
            message.delete();
            return;
        }


        if (!message.channel.topic || !message.channel.topic.startsWith("Ticket ouvert par")) {
            return message.reply("❌ Cette commande doit être utilisée dans un ticket.");
        }

        let ticketNumber = null;

        if (args.length > 0) {
            if (isNaN(args[0])) {
                return message.reply("❌ Veuillez fournir un numéro de ticket valide.");
            }
            ticketNumber = parseInt(args[0], 10);
        }

        if (ticketNumber !== null) {
            await message.reply(`🔍 Fermeture du ticket numéro ${ticketNumber} dans 10 secondes`);
        } else {
            await message.reply("🔍 Fermeture du ticket actuel dans 10 secondes");
        }

        // attendre 10 secondes avant de fermer le ticket
        await new Promise(resolve => setTimeout(resolve, 10000));

        try {
            await handleTicketClosure.handleTicketClosure(client, message, ticketNumber);
        } catch (error) {
            console.error(`[ERROR] Erreur lors de la fermeture du ticket : ${error.message}`);
            message.reply("❌ Impossible de fermer le ticket.");
        }
    },
};
