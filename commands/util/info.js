const { EmbedBuilder } = require("discord.js");
const systeminformation = require("systeminformation")
const { version, name } = require('../../package.json')
const pm2 = require("pm2")

module.exports = {
  name: "info",
  category: "util",
  permissions: ["SendMessages", "ViewChannel", "DEVELOPER"],
  usage: "info",
  examples: ["info"],
  description: "Permet de voir les informations sur le bot",
  async run(client, message, args) {

    const loading = client.emojis.cache.get("1372215665016176683");

    const tryPing = await client.channels.cache.get("1384257974049968130").send(
      "Calcul du ping en cours ... Merci de patienter."
    );

    const pingBot = tryPing.createdTimestamp - message.createdTimestamp

    // supprimer le message tryPing
    tryPing.delete();

    const tempEmbed = new EmbedBuilder()
      .setColor('Purple')
      .setDescription(`${loading} Génération de l'embed`)

    const SendInfo = await message.channel.send({ embeds: [tempEmbed] });

    let guildCount = await client.guilds.fetch();
    let usersCount = await client.guilds.cache.reduce(
      (a, g) => a + g.memberCount,
      0
    );

    const siCPU = await systeminformation.cpu()
    const siOS = await systeminformation.osInfo()
    const siMem = await systeminformation.mem()
    const maxMem = (siMem.total / 1024 / 1024 / 1024).toFixed(2)

    pm2.describe(name, (error, ls) => {

      let ps = ls[0];

      let tbl = {
        mem: (ps.monit.memory / 1024 / 1024).toFixed(1) + " MB",
        cpu: (ps.monit.cpu).toFixed(1) + "%",
      }

      const embed = new EmbedBuilder()
        .setTitle(`Informations sur ${client.user.username}`)
        .setThumbnail(client.user.displayAvatarURL())
        .addFields([
          {
            name: "Developpeur",
            value: "- <@340957191718699038>",
          },
          {
            name: "Version du bot",
            value: version,
            inline: true,
          },
          {
            name: "Version de discord.js",
            value: `v${require("discord.js").version}`,
            inline: true,
          },
          {
            name: "Version de Node.js",
            value: `${process.version}`,
            inline: true,
          },
          {
            name: "Présent sur",
            value: `${client.guilds.cache.size} serveurs`,
            inline: true,
          },
          {
            name: "Je surveille",
            value: `${usersCount} utilisateurs`,
            inline: true,
          },
          {
            name: '** **',
            value: '** **',
            inline: true,
          },
          {
            name: "En ligne depuis",
            value: `<t:${parseInt(client.readyTimestamp / 1000)}:R>`,
            inline: true,
          },
          {
            name: "Latence du Bot",
            value: `\`\`\`${pingBot}ms\`\`\``,
            inline: true,
          },
          {
            name: "Latence de l'API",
            value: `\`\`\`${client.ws.ping}ms\`\`\``,
            inline: true,
          },
          {
            name: "Modèle du CPU",
            value: `\`\`\`${siCPU.manufacturer} ${siCPU.brand} @ ${siCPU.speed}GHz\`\`\``,
          },
          {
            name: "Utilisation du CPU",
            value: `\`\`\`${tbl.cpu} / ${siCPU.cores * 100}% | (${siCPU.cores} vCPU)\`\`\``,
            inline: true,
          },
          {
            name: "Utilisation RAM",
            value: `\`\`\`${tbl.mem} / ${maxMem} GB\`\`\``,
            inline: true,
          },
          {
            name: "Version de l'OS",
            value: `\`\`\`${siOS.distro} ${siOS.release}\`\`\``,
          },
        ]);

      SendInfo.edit({ embeds: [embed] });
    });
    message.delete();
  },
};
