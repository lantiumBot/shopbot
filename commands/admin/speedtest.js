const { EmbedBuilder } = require("discord.js");

const fs = require("fs");
const exec = require("child_process");

module.exports = {
  name: "speedtest",
  category: "admin",
  permissions: ["DEVELOPER"],
  usage: "{prefix}speedtest",
  examples: ["speedtest"],
  description: "Permet de réaliser un speedtest sur le serveur",

  async run(client, message) {
    function speedtest() {
      let results = null;
      try {
        results = JSON.parse(
          exec.execSync(`speedtest -f json`).toString("utf-8")
        );
      } catch (err) {
        // fais ce que tu veux ici, moi je fais stopper la fn
        return message.channel.send(
          `Fréro ça a merdé, <@327193195085824001> Faut regarder l'erreur\n${err}`
        );
      }

      return {
        download: (results.download.bandwidth * 8 / 1000000).toFixed(2), // Convert bps to Mbps
        upload: (results.upload.bandwidth * 8 / 1000000).toFixed(2),     // Convert bps to Mbps
        ping: results.ping.latency.toFixed(2),
        url: results.result.url
      };

    }

    console.log(speedtest());

    const embedWait = new EmbedBuilder()
      .setTitle(
        "**Speedtest en cours** <:loading:1384850190665781340>"
      )
      .setTimestamp();

    const speedtestWait = await message.channel.send({
      embeds: [embedWait],
    });

    const speedtestResults = speedtest();
    if (!speedtestResults) {
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`Speedtest ! ${speedtestResults.url}`)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields([
        {
          name: "Download",
          value: `\`\`\`${speedtestResults.download} Mb/s\`\`\``,
          inline: true,
        },
        {
          name: "Upload",
          value: `\`\`\`${speedtestResults.upload} Mb/s\`\`\``,
          inline: true,
        },
        {
          name: "Ping",
          value: `\`\`\`${speedtestResults.ping} ms\`\`\``,
          inline: true,
        },
      ])
      .setTimestamp()
      .setFooter({
        text: message.author.username,
        iconURL: message.author.displayAvatarURL(),
      });

    speedtestWait.edit({ content: " ", embeds: [embed] });
  },

  async runInteraction(client, interaction) {
    function speedtest() {
      let results = null;
      try {
        results = JSON.parse(
          exec.execSync(`speedtest-cli --json`).toString("utf-8")
        );
      } catch (err) {
        // fais ce que tu veux ici, moi je fais stopper la fn
        return interaction.channel.send(
          `Fréro ça a merdé, <@327193195085824001> Faut regarder l'erreur\n${err}`
        );
      }

      return {
        download: (results.download / 1024 / 1024).toFixed(0),
        upload: (results.upload / 1024 / 1024).toFixed(0),
        ping: results.ping.toFixed(0),
      };
    }

    const embedWait = new EmbedBuilder()
      .setTitle(
        "**Speedtest en cours** <:loading:1384850190665781340>"
      )
      .setTimestamp();

    const speedtestWait = await interaction.reply({
      embeds: [embedWait],
    });

    //  await interaction.reply(
    //    "<:speedtest:1005585156259717262> Speedtest en cours <a:loading:1005584565026422945>"
    //  );

    const speedtestResults = await speedtest();
    if (!speedtestResults) {
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("Speedtest !")
      .setThumbnail(client.user.displayAvatarURL())
      .addFields([
        {
          name: "Download",
          value: `\`\`\`${speedtestResults.download} Mb/s\`\`\``,
          inline: true,
        },
        {
          name: "Upload",
          value: `\`\`\`${speedtestResults.upload} Mb/s\`\`\``,
          inline: true,
        },
        {
          name: "Ping",
          value: `\`\`\`${speedtestResults.ping} ms\`\`\``,
          inline: true,
        }
      ])
      .setTimestamp()
      .setFooter({
        text: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
      });

    await interaction.editReply({ content: " ", embeds: [embed] });
  },
};
