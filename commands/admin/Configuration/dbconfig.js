const { EmbedBuilder, ApplicationCommandOptionType, ApplicationCommandType } = require("discord.js");

let tab = ['prefix', 'logChannel', 'welcomeChannel', 'memberCountChannel', 'welcomeMessage']
let choises = []
tab.map(val => {
  choises.push({ name: val, value: val })
})

module.exports = {
  name: "dbconfig",
  category: "admin",
  permissions: ["Administrator", "ManageGuild", "DEVELOPER"],
  usage: `dbconfig [${tab.join(' | ')}] <value>`,
  examples: ["dbconfig", "dbconfig prefix ?", "dbconfig prefix"],
  description: `Configurer les données dans la base de données`,
  async run(client, message, args, guildSettings) {
    let embed = new EmbedBuilder()
      .setColor("Purple")

    if (!args[0] || !tab.includes(args[0])) {
      embed.setDescription(`Merci d'entrer une clé valide (${tab.join(' | ')})`)
      return message.reply({
        embeds: [embed]
      });
    }

    let key = args[0]
    let value = args[1];

    if (value) {
      await client.updateGuild(message.guild, { [key]: value });

      if (message.guild.channels.resolve(value)) value = `<#${value}>`
      if (message.guild.members.resolve(value)) value = `<@${value}>`
      if (message.guild.roles.resolve(value)) value = `<@&${value}>`

      embed.addFields([{ name: `${key} mis à jour :`, value: value }])
      message.reply({
        embeds: [embed]
      });

    } else {
      let canard = guildSettings[key]

      if (canard != undefined) {

        if (message.guild.channels.resolve(canard)) canard = `<#${canard}>`
        if (message.guild.members.resolve(canard)) canard = `<@${canard}>`
        if (message.guild.roles.resolve(canard)) canard = `<@&${canard}>`

        embed.addFields([{ name: `${key} :`, value: canard }])
      } else {
        embed.addFields([{ name: `${key} :`, value: "**Cette option n'est pas activé !**" }])
      }
      message.reply({
        embeds: [embed]
      });
    }
  },
  options: [
    {
      name: "key",
      description: "Choisir une clé à modifier ou afficher",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: choises
    },
    {
      name: "value",
      description: "Choisir la nouvelle valeur pour votre clé ! {{user}} pour mentionner un user",
      type: ApplicationCommandOptionType.String,
    },
  ],
  async runInteraction(client, interaction, guildSettings) {
    let key = interaction.options.getString("key");
    let value = interaction.options.getString("value");

    let embed = new EmbedBuilder()
      .setColor("Purple")

    if (value) {
      await client.updateGuild(interaction.guild, { [key]: value });

      if (interaction.guild.channels.resolve(value)) value = `<#${value}>`
      if (interaction.guild.members.resolve(value)) value = `<@${value}>`
      if (interaction.guild.roles.resolve(value)) value = `<@&${value}>`

      embed.addFields([{ name: `${key} mis à jour :`, value: value }],)
      return interaction.reply({
        embeds: [embed]
      })
    }
    else {
      let canard = guildSettings[key]

      if (canard != undefined) {

        if (interaction.guild.channels.resolve(canard)) canard = `<#${canard}>`
        if (interaction.guild.members.resolve(canard)) canard = `<@${canard}>`
        if (interaction.guild.roles.resolve(canard)) canard = `<@&${canard}>`

        embed.addFields([{ name: `${key} :`, value: canard}])
      } else {
        embed.addFields([{ name: `${key} :`, value: "**Cette option n'est pas activé !**" }])
      }

      //embed.addFields([{ name: `${key} :`, value: canard}])
      interaction.reply({
        embeds: [embed]
      });
    }
  },
};
