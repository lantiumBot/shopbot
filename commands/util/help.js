const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { readdirSync } = require("fs");
const commandFolder = readdirSync("./commands/");
const contextDescription = {
  userinfo: "Renvoie des informations sur l'utilisateur mentionné.",
};

module.exports = {
  name: "help",
  category: "util",
  permissions: ["SendMessages"],
  usage: "help <command>",
  examples: ["help", "help ping"],
  description:
    "Renvoie la liste des commandes disponibles ou renvoie des informations sur une commande.",
  async run(client, message, args, guildSettings) {
    const prefix = guildSettings.prefix;

    if (!args.length) {
      const noArgsEmbed = new EmbedBuilder()
        .setColor("#6e4aff")
        .addFields([
          {
            name: "Liste des commandes",
            value: `Une liste de toutes les catégories disponible et leurs commandes.\nPour plus d'informations sur une commande, taper \`${prefix}help <commande>\``,
          },
        ]);

      for (const category of commandFolder) {
        noArgsEmbed.addFields([{
          name: `± ${category.replace(/(^\w|\s\w)/g, (firstLetter) => firstLetter.toUpperCase())}`,
          value: `\`${client.commands.filter((cmd) => cmd.category == category.toLowerCase()).map((cmd) => cmd.name).join(", ")}\``
        }]);
      }

      return message.channel.send({ embeds: [noArgsEmbed] });
    }

    const cmd = client.commands.get(args[0]);
    if (!cmd) return message.reply("Cette commande n'existe pas.");

    return message.channel.send(`
\`\`\`makefile
[Help : Commande -> ${cmd.name}] ${
      cmd.devOnly ? "/!\\ Pour le developpeur uniquement /!\\" : ""
    }
Permissions : ${cmd.permissions.join(", ")}

${cmd.description ? cmd.description : contextDescription[`${cmd.name}`]}

Utilisation : ${prefix}${cmd.usage}
Examples: ${prefix}${cmd.examples.join(` | ${prefix}`)}

---

${prefix} = prefix utiliser pour le bot(/commands sont aussi disponibles)
{} = sous-commande(s) disponible(s) | [] = option(s) disponible(s) | <> = option(s) optionnel(s)
Ne pas inclure ces caractères -> {}, [] et <> dans vos commandes.
\`\`\``);
  },
  options: [
    {
      name: "command",
      description: "taper le nom de votre commande",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  async runInteraction(client, interaction, guildSettings) {
    const prefix = guildSettings.prefix;
    const cmdName = interaction.options.getString("command");

    if (!cmdName) {
      const noArgsEmbed = new EmbedBuilder()
        .setColor("#6e4aff")
        .addFields([{
          name: "Liste des commandes",
          value: `Une liste de toutes les catégories disponible et leurs commandes.\nPour plus d'informations sur une commande, taper \`${prefix}help <commande>\``
        }]);

      for (const category of commandFolder) {
        noArgsEmbed.addFields([{
          name: `± ${category.replace(/(^\w|\s\w)/g, (firstLetter) =>
            firstLetter.toUpperCase()
          )}`,
          value: `\`${client.commands
            .filter((cmd) => cmd.category == category.toLowerCase())
            .map((cmd) => cmd.name)
            .join(", ")}\``
        }]);
      }

      return interaction.reply({ embeds: [noArgsEmbed], ephemeral: false });
    }

    const cmd = client.commands.get(cmdName);
    if (!cmd)
      return interaction.reply({
        content: "Cette commande n'existe pas.",
        ephemeral: false,
      });

    return interaction.reply({
      content: `
\`\`\`makefile
[Help : Commande -> ${cmd.name}] ${
        cmd.ownerOnly ? "/!\\ Pour le developpeur uniquement /!\\" : ""
      }
Permissions : ${cmd.permissions.join(", ")}

${cmd.description ? cmd.description : contextDescription[`${cmd.name}`]}

Utilisation : ${prefix}${cmd.usage}
Examples: ${prefix}${cmd.examples.join(` | ${prefix}`)}

---

${prefix} = prefix utiliser pour le bot(/commands sont aussi disponibles)
{} = sous-commande(s) disponible(s) | [] = option(s) disponible(s) | <> = option(s) optionnel(s)
Ne pas inclure ces caractères -> {}, [] et <> dans vos commandes.
\`\`\``,
      ephemeral: false,
    });
  },
};
