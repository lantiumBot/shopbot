const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const Logger = require("../../utils/Logger");
const RepData = require("../../models/rep");
const SaleData = require("../../models/sale");
const ExchangeData = require("../../models/exchange");
const updateLeaderboard = require("../../utils/handlers/updateLeaderboard");
const { generateItemChoices } = require("../../utils/handlers/updateItemsCache");

const getMessage = require("../../utils/getMessage");
const { VENDOR_ROLE_ID } = require('../../ids');

const idCorrections = {
  "319912404135706634": "333314116817125376",
  "340957191718699038": "333314116817125376",
  "333314116817125376": "333314116817125376",
};

const paymentMap = {
  Paypal: "PayPal",
  Crypto: "Crypto",
  LTC: "Litecoin",
  Paysafecard: "Paysafecard",
  Revolut: "Revolut",
};

function normalizeAmount(amountInput, errorKey, interaction, { allowZero = false } = {}) {
  // amountInput peut déjà être un number (slash option type Number)
  const rawAmount = (amountInput ?? "").toString().replace(',', '.');
  const amount = Number(rawAmount);

  const invalid =
    Number.isNaN(amount) ||
    (!allowZero ? amount <= 0 : amount < 0); // <-- 0 autorisé seulement si allowZero=true

  if (invalid) {
    interaction.reply({
      content: getMessage(errorKey, interaction.locale),
      ephemeral: true,
    });
    throw new Error('invalid_amount');
  }

  const decimals = rawAmount.split('.')[1] || "";
  if (decimals.length > 2) {
    interaction.reply({
      content: getMessage('twoDecimalsOnly', interaction.locale),
      ephemeral: true,
    });
    throw new Error('too_many_decimals');
  }
  return amount;
}



module.exports = {
  name: "rep",
  category: "util",
  permissions: ["SendMessages"],
  usage: "/rep [vendeur] [quantité] [item] [prix] [moyen-de-paiement]",
  examples: ["/rep @Yubikey 3 'Décoration' 5 'PayPal'"],
  description: "Ajoute un rep à un vendeur et catégorise l'item.",
  options: [
    {
      name: "vente",
      description: "Ajoute un rep général pour une vente.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "vendeur",
          description: "Le vendeur à qui ajouter un rep.",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
        {
          name: "quantité",
          description: "La quantité d'items vendus (exemple : 3 ou 3k).",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "item",
          description: "L'item vendu (exemple : Décoration, Exchange, etc.).",
          type: ApplicationCommandOptionType.String,
          choices: generateItemChoices(client),
          required: true,
        },
        {
          name: "prix",
          description: "Le prix de l'item (exemple : 5).",
          type: ApplicationCommandOptionType.Number,
          required: true,
        },
        {
          name: "moyen-de-paiement",
          description:
            "Le moyen de paiement utilisé (exemple : PayPal, Crypto).",
          type: ApplicationCommandOptionType.String,
          choices: [
            { name: "PayPal", value: "Paypal" },
            { name: "Crypto", value: "Crypto" },
            { name: "Litecoin", value: "LTC" },
            { name: "Paysafecard", value: "Paysafecard" },
            { name: "Revolut", value: "Revolut" },
          ],
          required: true,
        },
        {
          name: "evaluation",
          description: "Evaluer la vente (mettre un chiffre entre 1 et 5)",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
        {
          name: "commentaire",
          description: "Ajouter un commentaire à la vente",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: "exchange",
      description: "Ajoute un rep spécifique pour les échanges.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "vendeur",
          description: "Le vendeur à qui ajouter un rep.",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
        {
          name: "from",
          description:
            "La monnaie ou le service d'origine (exemple : PayPal, LTC).",
          type: ApplicationCommandOptionType.String,
          choices: [
            { name: "PayPal", value: "PayPal" },
            { name: "Litecoin", value: "LTC" },
            { name: "Bitcoin", value: "BTC" },
            { name: "Ethereum", value: "ETH" },
            { name: "Crypto", value: "Crypto" },
            { name: "Revolut", value: "Revolut" },
            { name: "Paysafecard", value: "Paysafecard" },
          ],
          required: true,
        },
        {
          name: "montant-origine",
          description: "Le montant d'origine (exemple : 5).",
          type: ApplicationCommandOptionType.Number,
          required: true,
        },
        {
          name: "to",
          description:
            "La monnaie ou le service de destination (exemple : LTC, PayPal).",
          type: ApplicationCommandOptionType.String,
          choices: [
            { name: "PayPal", value: "PayPal" },
            { name: "Litecoin", value: "LTC" },
            { name: "Bitcoin", value: "BTC" },
            { name: "Ethereum", value: "ETH" },
            { name: "Crypto", value: "Crypto" },
            { name: "Revolut", value: "Revolut" },
          ],
          required: true,
        },
        {
          name: "montant-destination",
          description: "Le montant reçu (exemple : 5).",
          type: ApplicationCommandOptionType.Number,
          required: true,
        },
        {
          name: "evaluation",
          description: "Evaluer la vente (mettre un chiffre entre 1 et 5)",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
        {
          name: "commentaire",
          description: "Ajouter un commentaire à la vente",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
  ],

  async runInteraction(client, interaction) {
    const lang = interaction.locale?.startsWith?.("fr") ? "fr" : "en";
    try {
      const subcommand = interaction.options.getSubcommand();

      // IDs corrections, fetch member info
      const vendeurId = interaction.options.getString("vendeur");
      const correctedVendorId = idCorrections[vendeurId] || vendeurId;

      // ALWAYS fetch for latest roles/username
      let vendeurUser;
      try {
        const member = await interaction.guild.members.fetch({ user: correctedVendorId, cache: false }).catch(() => null);
        vendeurUser = member ? member.user : await client.users.fetch(correctedVendorId).catch(() => null);
      } catch { }
      const vendeurUsername = vendeurUser ? vendeurUser.username : "Unknown";

      // Vérification du rôle vendeur EN LIVE
      const guildMember = await interaction.guild.members.fetch({ user: correctedVendorId, cache: false }).catch(() => null);
      if (!guildMember || !guildMember.roles.cache.has(VENDOR_ROLE_ID)) {
        return interaction.reply({
          content: getMessage("repNotVendor", lang),
          ephemeral: true,
        });
      }

      // VENTE
      if (subcommand === "vente") {
        const quantity = interaction.options.getString("quantité");
        const item = interaction.options.getString("item");
        const price = normalizeAmount(
          interaction.options.getNumber("prix"),
          "invalidAmount",
          interaction,
          { allowZero: true } // <-- le cœur du sujet
        );
        const payment = paymentMap[interaction.options.getString("moyen-de-paiement")] || interaction.options.getString("moyen-de-paiement");
        let evaluationInput = interaction.options.getInteger("evaluation");
        const commentInput = interaction.options.getString("commentaire");
        const anonymous = false;

        let repData =
          (await RepData.findOne({ userId: correctedVendorId })) ||
          new RepData({ userId: correctedVendorId, username: vendeurUsername });
        repData.rep += 1;
        repData.totalSales += 1;
        await repData.save();

        await SaleData.create({
          repID: `${repData.totalSales}`,
          sellerId: correctedVendorId,
          buyerId: interaction.user.id,
          itemName: item,
          quantity,
          price,
          paymentMethod: payment,
          date: new Date(),
        });

        const totalRep = await RepData.aggregate([
          { $group: { _id: null, total: { $sum: "$rep" } } },
        ]);
        const totalRepValue = totalRep.length > 0 ? totalRep[0].total : 0;

        await updateLeaderboard(client);

        evaluationInput = Math.max(1, Math.min(5, evaluationInput || 1));
        const stars = "⭐".repeat(evaluationInput);
        const date = new Date();
        const time = date.toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const embed = new EmbedBuilder()
          .setTitle(
            (lang === "fr" ? "Nouvelle Vouch de " : "New vouch from ") +
            (anonymous ? (lang === "fr" ? "Anonyme" : "Anonymous") : interaction.user.username)
          )
          .setColor("White")
          .setThumbnail(
            anonymous
              ? interaction.guild.iconURL() || interaction.user.displayAvatarURL()
              : interaction.user.displayAvatarURL()
          )
          .setDescription(stars)
          .addFields(
            { name: lang === "fr" ? "Vendeur:" : "Vendor:", value: `<@${correctedVendorId}>`, inline: false },
            { name: lang === "fr" ? "Item vendu :" : "Item sold:", value: `${quantity} x ${item} (${price}€ via ${payment})`, inline: false },
            { name: lang === "fr" ? "Vouch N°:" : "Vouch #:", value: `${totalRepValue}`, inline: true },
            { name: lang === "fr" ? "Vouch par:" : "Vouch by:", value: anonymous ? (lang === "fr" ? "Anonyme" : "Anonymous") : `<@${interaction.user.id}>`, inline: true },
            { name: lang === "fr" ? "Date du vouch:" : "Vouch date:", value: time, inline: true }
          )
          .setFooter({ text: getMessage("ShopFooter", lang) })
          .setTimestamp();

        if (commentInput) {
          embed.addFields({ name: lang === "fr" ? "Commentaire:" : "Comment:", value: commentInput, inline: false });
        }

        if (anonymous) {
          await interaction.channel.send({ embeds: [embed] });
          await interaction.reply({ content: getMessage("repAnonSuccess", lang), ephemeral: true });
        } else {
          await interaction.reply({ embeds: [embed] });
        }
      }

      // EXCHANGE
      if (subcommand === "exchange") {
        const from = paymentMap[interaction.options.getString("from")] || interaction.options.getString("from");
        const montantOrigine = normalizeAmount(interaction.options.getNumber("montant-origine"), "invalidOrigine", interaction);
        const to = paymentMap[interaction.options.getString("to")] || interaction.options.getString("to");
        const montantDestination = normalizeAmount(interaction.options.getNumber("montant-destination"), "invalidDestination", interaction);

        const decimalPlacesOrigine = (montantOrigine.toString().split(/[.,]/)[1] || "").length;
        if (decimalPlacesOrigine > 2) {
          return interaction.reply({
            content: getMessage("repOrigineTwoDecimals", lang),
            ephemeral: true,
          });
        }
        const decimalPlacesDestination = (montantDestination.toString().split(/[.,]/)[1] || "").length;
        if (decimalPlacesDestination > 2) {
          return interaction.reply({
            content: getMessage("repDestinationTwoDecimals", lang),
            ephemeral: true,
          });
        }

        let evaluationInput = interaction.options.getInteger("evaluation");
        const commentInput = interaction.options.getString("commentaire");
        const anonymous = false;

        let repData =
          (await RepData.findOne({ userId: correctedVendorId })) ||
          new RepData({ userId: correctedVendorId, username: vendeurUsername });
        repData.rep += 1;
        repData.totalSales += 1;
        await repData.save();

        const totalRep = await RepData.aggregate([
          { $group: { _id: null, total: { $sum: "$rep" } } },
        ]);
        const totalRepValue = totalRep.length > 0 ? totalRep[0].total : 0;

        await ExchangeData.create({
          repID: `${repData.rep}`,
          sellerId: correctedVendorId,
          buyerId: interaction.user.id,
          paymentFrom: from,
          montantFrom: montantOrigine,
          paymentTo: to,
          montantTo: montantDestination,
          date: new Date(),
        });

        await updateLeaderboard(client);

        evaluationInput = Math.max(1, Math.min(5, evaluationInput || 1));
        const stars = "⭐".repeat(evaluationInput);
        const date = new Date();
        const time = date.toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const embed = new EmbedBuilder()
          .setTitle(
            (lang === "fr" ? "Nouvelle Vouch de " : "New vouch from ") +
            (anonymous ? (lang === "fr" ? "Anonyme" : "Anonymous") : interaction.user.username)
          )
          .setColor("White")
          .setThumbnail(
            anonymous
              ? interaction.guild.iconURL() || interaction.user.displayAvatarURL()
              : interaction.user.displayAvatarURL()
          )
          .setDescription(stars)
          .addFields(
            { name: lang === "fr" ? "Vendeur:" : "Vendor:", value: `<@${correctedVendorId}>`, inline: false },
            { name: lang === "fr" ? "Exchange :" : "Exchange:", value: `${montantOrigine}€ ${lang === "fr" ? "de" : "from"} ${from} ${lang === "fr" ? "vers" : "to"} ${montantDestination}€ ${lang === "fr" ? "en" : "in"} ${to}`, inline: false },
            { name: lang === "fr" ? "Vouch N°:" : "Vouch #:", value: `${totalRepValue}`, inline: true },
            { name: lang === "fr" ? "Vouch par:" : "Vouch by:", value: anonymous ? (lang === "fr" ? "Anonyme" : "Anonymous") : `<@${interaction.user.id}>`, inline: true },
            { name: lang === "fr" ? "Date du vouch:" : "Vouch date:", value: time, inline: true }
          )
          .setFooter({ text: getMessage("ShopFooter", lang) })
          .setTimestamp();
        if (commentInput) {
          embed.addFields({ name: lang === "fr" ? "Commentaire:" : "Comment:", value: commentInput, inline: false });
        }

        if (anonymous) {
          await interaction.channel.send({ embeds: [embed] });
          await interaction.reply({ content: getMessage("repAnonSuccess", lang), ephemeral: true });
        } else {
          await interaction.reply({ embeds: [embed] });
        }
      }
    } catch (error) {
      Logger.error(`Erreur lors de l'exécution de la commande /rep : ${error.message}`);
      interaction.reply({
        content: getMessage("repError", interaction.locale),
        ephemeral: true,
      });
    }
  }
};
