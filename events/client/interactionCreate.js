// events/client/interactionCreate.js

const fs = require("fs");
var friendFile = JSON.parse(fs.readFileSync("./friend.json"));
const {
  InteractionType,
  EmbedBuilder,
} = require("discord.js");
const Logger = require("../../utils/Logger");
const handleTicketClosure = require("../../utils/handlers/handleTicketClosure");

const handleTicketCreation = require("../../utils/handlers/handleTicketCreation");
const { VENDOR_ROLE_ID, REPUTATION_CHANNEL_ID, STAFF_ROLE_ID } = require('../../ids');

const priceMessages = require('../../utils/handlers/priceMessages');

// --- i18n helpers + cache IDs
const PRICE_BTN_COOLDOWN_MS = 2000;
let PRICE_IDS_CACHE = null;

function resolveLang(guildSettings, interaction) {
  // ordre: réglage serveur > locale de l'utilisateur > fr
  const raw =
    (guildSettings && (guildSettings.language || guildSettings.lang || guildSettings.locale)) ||
    interaction?.locale ||
    "fr";
  return String(raw).toLowerCase().startsWith("en") ? "en" : "fr";
}


module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(client, interaction) {
    let guildSettings = await client.getGuild(interaction.guild);

    if (!guildSettings) {
      await client.createGuild(interaction.guild);
      guildSettings = await client.getGuild(interaction.guild);
      return interaction.reply(
        "Le bot a mis à jour la base de données, retapez la commande !"
      );
    }

    // ======= AJOUT POUR AUTOCOMPLETE ==========

    if (interaction.isAutocomplete()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;
      if (interaction.commandName === "rep") {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name === "vendeur") {
          const focusedValue = interaction.options.getFocused();
          const role = await interaction.guild.roles.fetch(VENDOR_ROLE_ID);
          if (!role) return interaction.respond([]);
          let choices = role.members.map(member => ({
            name: member.user.tag,
            value: member.user.id
          }));
          if (focusedValue) {
            choices = choices.filter(choice =>
              choice.name.toLowerCase().includes(focusedValue.toLowerCase())
            );
          }
          choices = choices.slice(0, 25);
          return interaction.respond(choices);
        }
      }
      return;
    }
    // ======= FIN AUTOCOMPLETE ==========

    // Gestion des commandes slash ou contextuelles
    if (
      interaction.type === InteractionType.ApplicationCommand ||
      interaction.isUserContextMenuCommand()
    ) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return interaction.reply(`Cette commande n'existe pas !`);

      let permission = interaction.member.permissions.toArray();

      await friend(permission, interaction.user.id);

      let canExec = false;
      cmd.permissions.forEach((element) => {
        if (permission.includes(element)) {
          canExec = true;
        }
      });
      if (!canExec)
        return interaction.reply({
          content: `Vous n'avez pas la/les permission(s) requise(s) (\`${cmd.permissions.join(
            ", "
          )}\`) pour taper cette commande !`,
          ephemeral: true,
        });

      try {
        cmd.runInteraction(client, interaction, guildSettings);
      } catch (e) {
        interaction.reply({
          content: `Cette interaction n'est pas encore implémentée !\n Merci d'utiliser la commande avec le prefix \`${guildSettings.prefix}\` !`,
          ephemeral: true,
        });
      }
    }

    // Gestion des interactions bouton
    if (interaction.isButton()) {
      const customId = interaction.customId;

      if (customId.startsWith("restore_")) {
        const messageId = customId.slice("restore_".length);
        try {
          // On récupère le message supprimé depuis la DB
          const DeletedMessage = require('../../models/DeletedMessage');
          const doc = await DeletedMessage.findOne({ messageId });
          if (!doc) {
            return interaction.reply({ content: "Message non trouvé en DB.", ephemeral: true });
          }

          // Récupération du membre dans la guilde pour obtenir le displayName et l'avatar
          const member = interaction.guild.members.cache.get(doc.authorId);
          const displayName = member ? member.displayName : doc.authorTag;

          // Création de l'embed de restauration
          const restoreEmbed = new EmbedBuilder()
            .setAuthor({
              name: `${doc.authorTag} (${displayName})`,
              iconURL: member ? member.displayAvatarURL({ dynamic: true }) : null
            })
            .setDescription(doc.content || "Aucun contenu")
            .setFooter({ text: new Date(doc.timestamp).toLocaleString("fr-FR") })

          const vouchChannel = await client.channels.cache.get(REPUTATION_CHANNEL_ID);
          if (!vouchChannel) {
            return interaction.reply({ content: "Le salon de vouch n'a pas été trouvé.", ephemeral: true });
          }

          await vouchChannel.send({ embeds: [restoreEmbed] });
          interaction.reply({ content: "Message restauré dans le salon de vouch !", ephemeral: true });

          // Optionnel : suppression de l'entrée en DB après restauration
          await DeletedMessage.deleteOne({ messageId });
        } catch (error) {
          Logger.error("Erreur lors de la restauration :", error);
          interaction.reply({ content: "Erreur interne.", ephemeral: true });
        }
      }
      else if (customId.startsWith("open_ticket")) {
        await handleTicketCreation(client, interaction, customId);
      } else if (customId === "close_ticket") {
        if (interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
          await handleTicketClosure.handleTicketClosure(client, interaction);
        } else {
          interaction.reply({
            content: "Vous n'avez pas la permission de fermer ce ticket.",
            ephemeral: true,
          });
        }
      } 
      
      // --- Boutons "prix" localisés (IDs dynamiques)
      else {
        // Build/Cache la liste complète des IDs déclarés côté priceMessages
        if (!PRICE_IDS_CACHE) {
          try {
            PRICE_IDS_CACHE = new Set(priceMessages.getButtonsMeta().map(b => b.id));
          } catch {
            PRICE_IDS_CACHE = new Set(); // fallback
          }
        }

        const isPriceBtn =
          customId.startsWith("price_item_") || // compat ancien prefix si tu l'utilises encore
          PRICE_IDS_CACHE.has(customId);        // ex: "nitro_boost", "decoration", ...

        if (isPriceBtn) {
          // Cooldown anti-spam
          if (!client.priceBtnCooldowns) client.priceBtnCooldowns = new Map();
          const last = client.priceBtnCooldowns.get(interaction.user.id) || 0;
          const now = Date.now();
          if (now - last < PRICE_BTN_COOLDOWN_MS) {
            const lang = resolveLang(guildSettings, interaction);
            return interaction.reply({
              ephemeral: true,
              content: lang === "en"
                ? "Easy. Too fast, try again in a second ✋"
                : "Tranquille. Clique trop rapide, réessaie dans une seconde ✋",
            });
          }
          client.priceBtnCooldowns.set(interaction.user.id, now);

          // Résolution de la langue et réponse
          const lang = resolveLang(guildSettings, interaction);
          const replyPayload = priceMessages.getReplyByCustomId(customId, lang); // ← utilise messages.js via priceMessages i18n

          if (interaction.replied || interaction.deferred) {
            return interaction.followUp({ ...replyPayload, ephemeral: true });
          }
          return interaction.reply({ ...replyPayload, ephemeral: true });
        }
      }
    }
  },
};

// La fonction friend reste inchangée
async function friend(permissions, userId) {
  if (friendFile.hasOwnProperty(userId))
    friendFile[userId].forEach((element) => {
      permissions.push(element);
    });
  return permissions;
}