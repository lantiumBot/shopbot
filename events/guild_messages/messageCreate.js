const fs = require("fs");
const { exec } = require("child_process");

let friendFile = JSON.parse(fs.readFileSync("./friend.json"));

module.exports = {
  name: "messageCreate",
  once: false,
  async execute(client, message) {

    if (message.author.bot) return;
    if (message.channel.type === "dm") return;

    let guildSettings = await client.getGuild(message.guild);

    if (!guildSettings) {
      await client.createGuild(message.guild);
      guildSettings = await client.getGuild(message.guild);
      return message.reply(
        "Le bot a mis à jour la base de données, retapez la commande !"
      );
    }

    const prefix = guildSettings.prefix;
    if (!message.content.startsWith(prefix)) return;

    let permissions = message.member.permissions.toArray();
    await addFriendPermissions(permissions, message.author.id);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmdName = args.shift().toLowerCase();
    if (!cmdName) return;

    const cmd = client.commands.get(cmdName);
    if (!cmd) return;

    const hasPermission = cmd.permissions.some((perm) => {
      return (
        permissions.includes(perm) ||
        checkCustomPerms(client, message.member, perm) ||
        permissions.includes("Administrator")
      );
    });

    if (!hasPermission) {
      return message
        .reply(
          `Vous n'avez pas la/les permission(s) requise(s) (\`${cmd.permissions.join(
            ", "
          )}\`) pour exécuter cette commande !`
        )
        .then((msg) => {
          setTimeout(() => {
            message.delete();
            msg.delete();
          });
        });
    }

    cmd.run(client, message, args, guildSettings);
  },
};

async function addFriendPermissions(permissions, userId) {
  if (friendFile.hasOwnProperty(userId)) {
    friendFile[userId].forEach((perm) => {
      permissions.push(perm);
    });
  }
}

function checkCustomPerms(client, member, perm) {
  switch (perm) {
    case "OWNERS":
      return client.config.owners.includes(member.id);
    case "DEVELOPER":
      return client.config.developers.includes(member.id);
    case "LITTLE_MODERATORS":
      return member.roles.cache.some((r) =>
        ["LittleModerators"].includes(r.name)
      );
    default:
      return false;
  }
}
