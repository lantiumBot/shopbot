const { ApplicationCommandType, PermissionsBitField } = require("discord.js");
const { promisify } = require("util");
const { glob } = require("glob");
const pGlob = promisify(glob);
const Logger = require("../Logger");

module.exports = async (client) => {
  (await pGlob(`${process.cwd()}/commands/**/*.js`)).map(async (cmdFile) => {
    const cmd = require(cmdFile);

    if (!cmd.name)
      return Logger.warn(
        `Commande non-chargée: ajouter un nom à votre commande ↓\nFichier => ${cmdFile}`
      );

    if (!cmd.description && cmd.type != ApplicationCommandType.User)
      return Logger.warn(
        `Commande non-chargée: ajouter une description à votre commande ↓\nFichier => ${cmdFile}`
      );

    if (!cmd.category)
      return Logger.warn(
        `Commande non-chargée: ajouter une categorie à votre commande ↓\nFichier => ${cmdFile}`
      );

    if (!cmd.permissions)
      return Logger.warn(
        `Commande non-chargée: ajouter des permissions à votre commande ↓\nFichier => ${cmdFile}`
      );

    if (!cmd.usage)
      return Logger.warn(
        `Commande non-chargée: ajouter une utilisation (usage) à votre commande ↓\nFichier => ${cmdFile}`
      );

    if (!cmd.examples)
      return Logger.warn(
        `Commande non-chargée: ajouter des exemples (examples) à votre commande ↓\nFichier => ${cmdFile}`
      );

    cmd.permissions.forEach((permission) => {
      if (
        !permissionList.includes(permission) &&
        !Object.keys(PermissionsBitField.Flags).includes(permission)
      ) {
        return Logger.typo(
          `Commande non-chargée: erreur de typo ou permission invalide '${permission}' ↓\nFichier => ${cmdFile}`
        );
      }
    });

    client.commands.set(cmd.name, cmd);
    Logger.command(`- ${cmd.name} (Permissions: ${cmd.permissions.join(", ")})`);
  });
};

const permissionList = [
  "DEVELOPER",
  "OWNERS",
  "VENDOR",
  "LITTLE_MODERATORS",
  "STAFF"
];

// Ajout dynamique des permissions Discord
Object.keys(PermissionsBitField.Flags).forEach((perm) =>
  permissionList.push(perm)
);
