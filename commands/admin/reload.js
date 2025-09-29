module.exports = {
  name: "reload",
  category: "admin",
  permissions: ["OWNERS"],
  usage: "reload",
  examples: ["reload"],
  description: "Relancer le bot",
  async run(client, message, args) {
    await message.reply("Le bot redémarre ...").then((sentMessage) => {
      setTimeout(() => {
        sentMessage.delete().catch(console.error);
      }, 5000); // Supprime le message après 5 secondes
    });

    return process.exit();
  },
  async runInteraction(client, interaction) {
    await interaction.reply({
      content: "Le bot redémarre ...",
      ephemeral: true,
    });
    return process.exit();
  },
};
