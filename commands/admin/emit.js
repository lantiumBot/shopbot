const { ApplicationCommandOptionType } = require("discord.js");

let tab = ['guildMemberAdd', 'guildMemberRemove', 'guildCreate', 'guildMemberUpdate']
let choises = []
tab.map(val => {
  choises.push({ name: val, value: val })
})

module.exports = {
  name: "emit",
  category: "admin",
  permissions: ["DEVELOPER"],
  usage: "emit [eventName]",
  examples: ["emit", "emit guildMemberAdd"],
  description: "Emettre un évènement au choix",
  run: (client, message, args) => {
    if (!args[0] || !tab.includes(args[0]))
      return message.reply(
        `Merci d'entrer un évènement valide (${tab.join(' | ')})`
      );

    if (args[0].includes("guildMember")) { client.emit(args[0], message.member) }
    if (args[0].includes("guildCreate")) { client.emit(args[0], message.guild) }

    //client.emit(args[0], message.guild);
    message.reply(`Event ${args[0]} émit`);
  },
  options: [
    {
      name: "event",
      description: "Choisir un évènement à émettre",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: choises,
    },
  ],
  runInteraction: (client, interaction) => {
    const evtChoices = interaction.options.getString("event");

    if (evtChoices.includes("guildMember")) { client.emit(evtChoices, interaction.member) }
    if (evtChoices.includes("guildCreate")) { client.emit(evtChoices, interaction.guild) }

    interaction.reply({
      content: `Event ${evtChoices} émit`,
      ephemeral: true,
    });
  },
};