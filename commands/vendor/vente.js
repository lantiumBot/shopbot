const { EmbedBuilder } = require("discord.js");
const getMessage = require("../../utils/getMessage");

module.exports = {
  name: "vente",
  category: "vendor",
  permissions: ["SendMessages"],
  usage: "vente",
  examples: ["vente"],
  description: "Envoie les informations de paiement pour les ventes",
  async run(client, message) {
    message.delete();

    // Détecte la locale (compatibilité : Discord.js V14+ => message.author.locale, sinon fallback)
    const locale = message.author?.locale
      || message.guild?.preferredLocale
      || "fr"; // Par défaut FR si rien

    const embed = new EmbedBuilder()
      .setTitle(getMessage("PaiementTitle", locale))
      .addFields([
        {
          name: getMessage("Paypal", locale),
          value: getMessage("VentePaypalValue", locale),
        },
        {
          name: getMessage("Revolut", locale),
          value: getMessage("RevolutValue", locale),
        },
        {
          name: getMessage("LTC", locale),
          value: getMessage("LTCValue", locale),
        },
        {
          name: getMessage("Paysafecard", locale),
          value: getMessage("PaysafecardValue", locale),
        }
      ])
      .setFooter({
        text: getMessage("ShopFooter", locale),
      });

    message.channel.send({ embeds: [embed] });
  },
};
