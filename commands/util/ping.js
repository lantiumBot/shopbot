const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "ping",
  category: "util",
  permissions: ["SendMessages"],
  usage: "ping",
  examples: ["ping"],
  description: "La commande ping renvoie la latence du bot et de l'API",
  async run(client, message, args) {
    const tryPing = await message.channel.send(
      "Calcul du ping en cours ... Merci de patienter."
    );

    const embed = new EmbedBuilder()
      .setTitle("Pong !")
      .setThumbnail(client.user.displayAvatarURL())
      .addFields([
        {
          name: "Latence API ",
          value: `\`\`\`${client.ws.ping}ms\`\`\``,
          inline: true,
        },
        {
          name: "Latence BOT",
          value: `\`\`\`${tryPing.createdTimestamp - message.createdTimestamp
            }ms\`\`\``,
          inline: true,
        },
        {
          name: "Uptime BOT",
          value: `<t:${parseInt(client.readyTimestamp / 1000)}:R>`,
          inline: true,
        },
      ])
      .setTimestamp()
      .setFooter({
        text: message.author.username,
        iconURL: message.author.displayAvatarURL(),
      });

    tryPing.edit({ content: " ", embeds: [embed] });
  },

  //////////////////////////////////////////////////////////////////

  async runInteraction(client, interaction) {
    const tryPing = await interaction.reply({
      content: "Calcul du ping en cours ... Merci de patienter.",
      fetchReply: true,
    });

    const embed = new EmbedBuilder()
      .setTitle("Pong ! ...")
      .setThumbnail(client.user.displayAvatarURL())
      .addFields([
        {
          name: "Latence API ",
          value: `\`\`\`${client.ws.ping}ms\`\`\``,
          inline: true,
        },
        {
          name: "Latence BOT",
          value: `\`\`\`${tryPing.createdTimestamp - interaction.createdTimestamp
            }ms\`\`\``,
          inline: true,
        },
        {
          name: "Uptime BOT",
          value: `<t:${parseInt(client.readyTimestamp / 1000)}:R>`,
          inline: true,
        },
      ])
      .setTimestamp()
      .setFooter({
        text: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL()
      });

    interaction.editReply({ content: " ", embeds: [embed] });
  },
};
