const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const Logger = require("../../utils/Logger");
const getMessage = require("../../utils/getMessage");
const { CATEGORY_IDS } = require("../../ids");

const attenteChoices = [
  { name: "Nitro", value: "nitro" },
  { name: "Déco", value: "deco" },
  { name: "Account", value: "account" },
  { name: "Exchange", value: "exchange" },
  { name: "Boost", value: "boost" },
  { name: "Problème", value: "probleme" },
  { name: "Autre", value: "autre" },
];

module.exports = {
  name: "attente",
  category: "vendor",
  permissions: ["VENDOR", "STAFF"],
  usage: "+attente [Items]",
  examples: ["+attente", "+attente Nitro"],
  description: "Déplace le ticket dans la catégorie tout en conservant les permissions spécifiques.",
  options: [
    {
      name: "target",
      description: "Choisis la catégorie appropriée par item",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: attenteChoices,
    },
    {
      name: "lang",
      description: "Langue du message",
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        { name: "Français", value: "fr" },
        { name: "English", value: "en" }
      ],
    },
  ],
  async runInteraction(client, interaction) {
    const channel = interaction.channel;
    const target = interaction.options.getString("target");
    const lang =
      interaction.options.getString('lang') ||
      (interaction.locale?.startsWith("fr") ? "fr" : "en");
    const targetLabel = attenteChoices.find(c => c.value === target)?.name || target;

    // Vérification du ticket
    if (!channel.topic || !channel.topic.includes("Ticket ouvert par")) {
      return interaction.reply({
        content: getMessage("attenteNotTicket", lang),
        ephemeral: true,
      });
    }

    // ID de la catégorie destination
    const newCategoryId = CATEGORY_IDS[target];

    if (!newCategoryId) {
      return interaction.reply({
        content: getMessage("attenteCategoryUnknown", lang),
        ephemeral: true,
      });
    }

    try {
      // Récupérer les permissions actuelles avant de déplacer le salon
      const currentPermissions = channel.permissionOverwrites.cache;
      const permissionsToReapply = Array.from(currentPermissions.values()).map(
        (permission) => ({
          id: permission.id,
          allow: permission.allow.bitfield,
          deny: permission.deny.bitfield,
        })
      );

      // Move channel to new category
      await channel.setParent(newCategoryId);

      // Réappliquer les permissions existantes après le déplacement
      for (const permission of permissionsToReapply) {
        try {
          await channel.permissionOverwrites.edit(permission.id, {
            ViewChannel: permission.allow & PermissionFlagsBits.ViewChannel ? true : false,
            SendMessages: permission.allow & PermissionFlagsBits.SendMessages ? true : false,
            ReadMessageHistory: permission.allow & PermissionFlagsBits.ReadMessageHistory ? true : false,
          });
        } catch (error) {
          Logger.error(
            `Erreur lors de la réapplication des permissions pour l'ID ${permission.id}: ${error.message}`
          );
        }
      }

      // Ajouter les permissions pour l'utilisateur qui a ouvert le ticket
      const ticketCreator = permissionsToReapply.find(
        (p) =>
          p.id !== interaction.guild.id &&
          p.id !== client.user.id &&
          p.allow & PermissionFlagsBits.ViewChannel
      );

      if (ticketCreator) {
        try {
          await channel.permissionOverwrites.edit(ticketCreator.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
            AttachFiles: true,
            EmbedLinks: true,
          });
        } catch (error) {
          Logger.error(
            `Erreur lors de l'ajout des permissions pour le créateur du ticket: ${error.message}`
          );
        }
      }

      console.log('message retourné', getMessage("attenteSuccess", lang, targetLabel));
      await interaction.reply({
        content: getMessage("attenteSuccess", lang, targetLabel),
      });
    } catch (error) {
      Logger.error(`Erreur lors du déplacement du ticket : ${error.message}`);
      await interaction.reply({
        content: getMessage("attenteError", lang),
        ephemeral: true,
      });
    }
  },
};
