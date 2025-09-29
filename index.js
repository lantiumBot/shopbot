const { Client, Collection, Partials } = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();
const { connectToDatabase } = require('./utils/mongo'); // Importer la connexion MongoDB centralisée
const Logger = require("./utils/Logger");

const { ensureItemsCache, loadItems, updateCommandChoices } = require("./utils/handlers/updateItemsCache");
const autoUpdateEmbed = require("./utils/auto/autoUpdateEmbed");


global.client = new Client({
  intents: 3276799,
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  disableMentions: "everyone",
});

["commands"].forEach((x) => (client[x] = new Collection()));
["CommandUtil", "EventUtil"].forEach((handler) => {
  require(`./utils/handlers/${handler}`)(client);
});

require("./utils/Functions")(client);

// Gestion des exceptions et des erreurs
process.on("exit", (code) => {
  Logger.client(`Le processus s'est arrêté avec le code: ${code}!`);
});

process.on("uncaughtException", (err, origin) => {
  Logger.error(`UNCAUGHT_EXCEPTION: ${err}`);
  console.error(`Origine: ${origin}`);
});

process.on("unhandledRejection", (reason, promise) => {
  Logger.warn(`UNHANDLED_REJECTION: ${reason}`);
  console.log(promise);
});

process.on("warning", (...args) => Logger.warn(...args));

// Fonction principale pour démarrer le bot
(async () => {
  try {
    // Connexion à MongoDB
    await connectToDatabase();

    // Initialiser le cache des items
    ensureItemsCache(client);

    // Charger les items
    await loadItems(client);

    // Mettre à jour les commandes slash avec les nouveaux choix d'items
    await updateCommandChoices(client);

    // AutoUpdateEmbed stock
    // try {
    //   await autoUpdateEmbed(client);
    // } catch (error) {
    //   Logger.error(`Erreur lors de l'auto-update des embeds : ${error.message}`);
    // }

    // Connexion au bot Discord
    await client.login(process.env.DISCORD_TOKEN);

    Logger.client("🎉 Bot démarré avec succès !");
  } catch (error) {
    Logger.error(`Erreur critique au démarrage : ${error.message}`);
    process.exit(1); // Arrêter proprement si une erreur critique se produit
  }
})();
