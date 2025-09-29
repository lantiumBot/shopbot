const Logger = require("../../utils/Logger");
const setLogChannel = require('../../commands/admin/Configuration/setlogchannel');
const { TEST_SERVER_ID } = require('../../ids');
const { startStockWatcher } = require('../../utils/handlers/stocksellauth');

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    let guildCount = await client.guilds.fetch();
    let usersCount = await client.guilds.cache.reduce(
      (a, g) => a + g.memberCount,
      0
    );

    Logger.client(
      `- ${client.user.tag}, Je suis entièrement chargé ! Présent sur ${guildCount.size} serveur(s) pour ${usersCount} utilisateurs !`
    );
    client.user.setPresence({
      activities: [
        {
          name: ".gg/midnightsupply",
          type: "PLAYING",
        },
      ],
      status: "dnd",
    });

    // Commandes enregistrées dynamiquement
    const commands = client.commands.map((cmd) => ({
      name: cmd.name,
      description: cmd.description,
      options: cmd.options || [],
      defaultPermission: true,
    }));

    // // Enregistrement des commandes globales
    // try {
    //   await client.application.commands.set(commands);
    //   Logger.client("Commandes slash enregistrées globalement.");
    // } catch (error) {
    //   Logger.error(`Erreur lors de l'enregistrement global des commandes : ${error.message}`);
    // }

    // ID du serveur de test (pour les mises à jour instantanées) 
    const testGuild = client.guilds.cache.get(TEST_SERVER_ID);

    if (testGuild) {
      Logger.client("Commandes à enregistrer :", commands);

      try {
        await testGuild.commands.set(commands);
        Logger.client("[READY] Commandes slash enregistrées pour le serveur de test.");
      } catch (error) {
        Logger.error("[READY] Erreur lors de l'enregistrement des commandes pour le serveur de test :");
        Logger.error(error.message);

        // Identifier la commande problématique
        if (error.message.includes("options")) {
          const match = error.message.match(/(\d+)\.options/); // Récupère l'index de la commande
          if (match) {
            const commandIndex = parseInt(match[1], 10);
            const problematicCommand = commands[commandIndex];
            Logger.error(`[READY] La commande problématique est : ${problematicCommand.name}`);
          }
        }
      }
    } else {
      Logger.error(`[LINE 59] [READY] Impossible de trouver le serveur de test avec l'ID ${TEST_SERVER_ID}. Assurez-vous que le bot est bien présent dans ce serveur.`);
    }

    // await client.application.commands.set([])
    // Logger.client("[READY] Commandes slash supprimées.");

    // Démarrer la surveillance des stocks
    //startStockWatcher(client);
  },
};