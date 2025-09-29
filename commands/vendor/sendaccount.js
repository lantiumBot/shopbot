const { ApplicationCommandOptionType } = require("discord.js");
const getMessage = require("../../utils/getMessage");

module.exports = {
  name: "sendaccount",
  category: "vendor",
  permissions: ["VENDOR"],
  usage: "sendaccount <fourni> <info>",
  examples: ["sendaccount fourni <mail:password:token mail:password:token>"],
  description: "Envoie un ou plusieurs comptes à un utilisateur",
  options: [
    {
      name: "fournisseur",
      description: "Choisissez le fournisseur",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "Oblivision", value: "oblivision" },
        { name: "Iancu", value: "iancu" },
      ],
    },
    {
      name: "info",
      description: "Collez les comptes séparés par un espace",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "user",
      description: "Utilisateur à qui envoyer le compte",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: "lang",
      description: "Langue du message",
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        { name: "Français", value: "fr" },
        { name: "English", value: "en" },
      ],
    },
  ],
  async runInteraction(client, interaction) {
    const fournisseur = interaction.options.getString("fournisseur");
    const info = interaction.options.getString("info");
    const lang =
      interaction.options.getString("lang") ||
      (interaction.locale?.startsWith("fr") ? "fr" : "en");
    const user = interaction.options.getUser("user");

    // Découpe des comptes avec espace
    const comptes = info.trim().split(/\s+/);

    // Vérif rapide
    if (!comptes.length) {
      return interaction.reply({
        content: getMessage("sendaccountInvalidFormat", lang),
        ephemeral: true,
      });
    }

    // Message key selon fournisseur
    let messageKey =
      fournisseur.toLowerCase() === "oblivision"
        ? "sendaccountOblivision"
        : fournisseur.toLowerCase() === "iancu"
          ? "sendaccountIancu"
          : null;

    if (!messageKey) {
      return interaction.reply({
        content: getMessage("sendaccountUnknownProvider", lang),
        ephemeral: true,
      });
    }

    // Envoi de confirmation
    await interaction.reply({
      content: getMessage("sendaccountOk", lang),
      ephemeral: true,
    });

    // Traitement de chaque compte
    for (const compte of comptes) {
      const [email, password, token] = compte.split(":");
      if (!email || !password || !token) continue; // On skip si format invalide

      const formattedMessage = getMessage(
        messageKey,
        lang,
        email,
        password,
        token
      );

      try {
        if (user) {
          await user.send(formattedMessage);
        } else {
          await interaction.channel.send(formattedMessage);
        }
      } catch (error) {
        if (user) {
          await interaction.channel.send(formattedMessage);
          await interaction.followUp({
            content: getMessage("sendaccountDmFailed", lang),
            ephemeral: true,
          });
        }
      }
    }
  },
};
