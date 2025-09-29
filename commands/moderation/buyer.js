const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const Logger = require("../../utils/Logger");
const SaleData = require("../../models/sale");

module.exports = {
    name: "buyer",
    category: "moderation",
    permissions: ["STAFF"], // accessible à tous
    usage: "buyer",
    examples: ["buyer"],
    description: "Ajoute le role Buyer au membre mentionné",
    async run(client, message, args) {
        try {

            // récupération de l'utilisateur mentionné
            const userMentioned = message.mentions.members.first();
            if (!userMentioned) {
                return message.channel.send("Veuillez mentionner un utilisateur.");
            }
            // récupération du rôle Buyer
            const buyerRole = message.guild.roles.cache.find(role => role.id === "1391651538170286162");
            if (!buyerRole) {
                return message.channel.send("Le rôle 'Buyer' n'existe pas sur ce serveur.");
            }
            // ajout du rôle Buyer à l'utilisateur mentionné
            await userMentioned.roles.add(buyerRole);


        } catch (error) {
            Logger.error(`Erreur dans la commande buyer: ${error.message}`);
            message.channel.send("Une erreur est survenue lors de l'exécution de la commande.");
        }
    },
};