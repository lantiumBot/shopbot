const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "poll",
  category: "util",
  permissions: ["SendMessages"],
  usage: "poll [question]",
  examples: ["poll", "poll Quelle heure est-il ?"],
  description: "Poster votre propre sondage",
  async run(client, message, args) {
    if (!args[0])
      return message.reply(
        "Merci de rentrer une question pour votre sondage !"
      );

    const embed = new EmbedBuilder()
      .setTitle("Sondage")
      .setColor("BLUE")
      .setDescription(args.slice(0).join(" "))
      .setTimestamp()
      .setFooter(`Nouveau sondage généré par ${message.author.tag}!`);

    const poll = await message.reply({ embeds: [embed] });
    poll.react("✅");
    poll.react("❌");
    poll.react("🤷");
  },
  options: [
    {
      name: "title",
      description: "taper le titre de votre sondage",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "content",
      description: "taper la question de votre sondage",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  async runInteraction(client, interaction) {
    const pollTitle = interaction.options.getString("title");
    const pollContent = interaction.options.getString("content");

    const embed = new EmbedBuilder()
      .setTitle(pollTitle)
      .setColor("BLUE")
      .setDescription(pollContent)
      .setTimestamp()
      .setFooter(`Nouveau sondage généré par ${interaction.user.tag}!`);

    const poll = await interaction.reply({ embeds: [embed], fetchReply: true });
    poll.react("✅");
    poll.react("❌");
    poll.react("🤷");
  },
};
