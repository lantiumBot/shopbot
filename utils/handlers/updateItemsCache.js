const Logger = require("../../utils/Logger");
const items = require("../../models/item");
const { TEST_SERVER_ID } = require('../..//ids');


// Fonction utilitaire pour initialiser le cache des items
function ensureItemsCache(client) {
    if (!client.itemsCache) {
        client.itemsCache = new Map();
        Logger.client("[updateItemsCache] Initialisation du cache des items.");
    }
}

// Chargement des items depuis la base de données
async function loadItems(client) {
    try {
        // S'assurer que le cache est initialisé
        ensureItemsCache(client);

        const loadedItems = await items.find({});
        if (!loadedItems || loadedItems.length === 0) {
            Logger.warn("[updateItemsCache] Aucun item trouvé dans la base de données.");
            return;
        }

        // Remplir le cache avec les items chargés
        client.itemsCache.clear(); // Effacer le cache précédent pour éviter les doublons
        loadedItems.forEach((item) => {
            client.itemsCache.set(item.name, item);
        });
        Logger.client(`[updateItemsCache] Items chargés depuis la base de données : ${loadedItems.length} items.`);
    } catch (error) {
        Logger.error(`[updateItemsCache] Erreur lors du chargement des items : ${error.message}`);
    }
}

// Générer les choix pour l'option 'item'
function generateItemChoices(client) {
    if (!client.itemsCache || client.itemsCache.size === 0) {
        Logger.warn("[updateItemsCache] Le cache des items n'est pas encore chargé ou est vide.");
        return [];
    }
    return Array.from(client.itemsCache.keys()).map((itemName) => ({
        name: itemName,
        value: itemName,
    }));
}

async function updateCommandChoices(client) {
    try {
        // S'assurer que le cache est initialisé
        if (!client.itemsCache || client.itemsCache.size === 0) {
            Logger.warn("[updateItemsCache] Le cache des items est vide. Les choix des commandes slash ne seront pas mis à jour.");
            return;
        }

        // Mettre à jour les commandes avec les nouveaux choix d'items
        const commands = client.commands.map((cmd) => {
            if (cmd.name === "rep") {
                cmd.options = cmd.options.map((option) => {
                    if (option.name === "vente") {
                        option.options = option.options.map((subOption) => {
                            if (subOption.name === "item") {
                                subOption.choices = Array.from(client.itemsCache.keys()).map((itemName) => ({
                                    name: itemName,
                                    value: itemName,
                                }));
                            }
                            return subOption;
                        });
                    }
                    return option;
                });
            }
            return cmd;
        });

        // ID du serveur de test

        const testGuild = client.guilds.cache.get(TEST_SERVER_ID);
        if (testGuild) {
            await testGuild.commands.set(commands);
            Logger.client("[updateItemsCache] Commandes slash mises à jour avec les nouveaux choix d'items.");
        } else {
            Logger.error(`[updateItemsCache] Impossible de trouver le serveur de test avec l'ID ${TEST_SERVER_ID}. Assurez-vous que le bot est bien présent dans ce serveur.`);
        }
    } catch (error) {
        Logger.error(`[updateItemsCache] Erreur lors de la mise à jour des commandes slash : ${error.message}`);
    }
}

module.exports = {
    ensureItemsCache,
    loadItems,
    generateItemChoices,
    updateCommandChoices,
};