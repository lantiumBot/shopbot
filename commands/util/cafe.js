

module.exports = {
  name: "cafe",
  category: "util",
  permissions: ["Administrator", "DEVELOPER"],
  usage: "cafe",
  examples: ["cafe"],
  description: "CAFE !",
  async run(client, message, args) {
    message.delete();
    message.channel.send(
      "N'est-il pas l'heure de prendre un bon café ☕ ?\n\nPassez une bonne journée !!"
    );
  },
  async runInteraction(client, interaction) {
    interaction.reply(
      "N'est-il pas l'heure de prendre un bon café ☕ ?\n\nPassez une bonne journée !!"
    );
  },
};