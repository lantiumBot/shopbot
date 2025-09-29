const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const Logger = require("../../utils/Logger");
const { VOICE_CHANNEL_STATUS_ID, CHAT_CHANNEL_STATUS_ID } = require("../../ids"); // Adjust path as needed

module.exports = {
  name: "shop",
  category: "developer",
  permissions: ["STAFF"],
  usage: "shop <on/off>",
  examples: ["shop on / shop off"],
  description: "Set the Shop status ON or OFF.",
  async run(client, message, args) {
    message.delete().catch(console.error);

    if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
      const embedStatus = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle(":warning: Shop status not specified")
        .setDescription("Please specify `on` or `off`.");

      try {
        const channel = await client.channels.fetch(CHAT_CHANNEL_STATUS_ID);
        if (channel && channel.isTextBased()) {
          await channel.send({ embeds: [embedStatus] });
        }
      } catch (error) {
        Logger.error(
          `Error sending status embed to channel ${CHAT_CHANNEL_STATUS_ID}: ${error.message}`
        );
      }

      return message.reply("OK").then((msg) => {
        setTimeout(() => {
          msg.delete().catch(console.error);
        }, 5000);
      });
    }

    const shopStatus = args[0].toLowerCase();
    const embed = new EmbedBuilder()
      .setColor(shopStatus === "on" ? "Green" : "Red")
      .setDescription(
        shopStatus === "on"
          ? ":green_circle: Shop open!"
          : ":red_circle: Shop closed, please wait!"
      );

    // Vocal channel name update
    try {
      const voiceChannel = await client.channels.fetch(VOICE_CHANNEL_STATUS_ID);
      if (voiceChannel && voiceChannel.isVoiceBased()) {
        const newName =
          shopStatus === "on" ? "🟢 Shop Open" : "🔴 Shop Closed";
        await voiceChannel.setName(newName);
      }
    } catch (error) {
      Logger.error(
        `Error updating voice channel name (${VOICE_CHANNEL_STATUS_ID}): ${error.message}`
      );
    }

    // Chat channel notification
    try {
      const chatChannel = await client.channels.fetch(CHAT_CHANNEL_STATUS_ID);
      if (chatChannel && chatChannel.isTextBased()) {
        await chatChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Yellow")
              .setDescription(
                `The shop is now ${shopStatus === "on" ? "open" : "closed"}.`
              ),
          ],
        });
      }
    } catch (error) {
      Logger.error(
        `Error sending shop status message in channel ${CHAT_CHANNEL_STATUS_ID}: ${error.message}`
      );
    }
  },
};
