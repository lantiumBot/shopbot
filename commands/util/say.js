const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: "say",
  category: "util",
  permissions: ["SendMessages"],
  usage: "{prefix}say <message>",
  examples: ["say Salut"],
  description: "Le bot répètera ce que vous dites",
  async run(client, message, args) {
    if (!args[0])
      return message.channel.send({
        content: `Vous devez entrer un message à répéter ${message.author}... try again ? ❌`,
      });

    message.delete();
    message.channel.send(args.join(" "));
  },
  options: [
    {
      name: "message",
      description: "Taper la phrase à faire dire au bot",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  async runInteraction(client, interaction) {
    const message = interaction.options.getString("message");

    interaction.reply(message);
  },
};
