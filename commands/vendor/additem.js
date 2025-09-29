const { ApplicationCommandOptionType } = require('discord.js');
const Logger = require('../../utils/Logger');
const items = require('../../models/item');
const { ensureItemsCache, updateCommandChoices } = require('../../utils/handlers/updateItemsCache'); // Importer les fonctions utilitaires
const { exec } = require('child_process'); // Pour exécuter des commandes système

module.exports = {
    name: "additem",
    category: "admin",
    permissions: ["Administrator"],
    usage: "/ajouteritem <nom> <description>",
    examples: "/ajouteritem item1 \"Ceci est un exemple d'item\"",
    description: "Ajoute un nouvel item à la base de données.",
    options: [
        {
            name: "nom",
            description: "Le nom de l'item.",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "description",
            description: "La description de l'item.",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    async runInteraction(client, interaction) {
        const itemName = interaction.options.getString("nom");
        const itemDescription = interaction.options.getString("description");

        try {
            // Vérifier si l'item existe déjà dans la base de données
            const existingItem = await items.findOne({ name: itemName });
            if (existingItem) {
                return interaction.reply({
                    content: "❌ Cet item existe déjà dans la base de données.",
                    ephemeral: true,
                });
            }

            // Ajouter le nouvel item à la base de données
            const newItem = new items({ name: itemName, value: itemDescription });
            await newItem.save();
            Logger.client(`Nouvel item ajouté à la base de données : ${itemName}`);

            // S'assurer que le cache est initialisé
            ensureItemsCache(client);

            // Ajouter le nouvel item au cache
            client.itemsCache.set(itemName, newItem);
            Logger.client(`Nouvel item ajouté au cache : ${itemName}`);

            // Mettre à jour les commandes slash avec les nouveaux choix
            await updateCommandChoices(client);
            Logger.client("Commandes slash mises à jour avec les nouveaux choix d'items.");

            // Répondre à l'utilisateur avec un message et des réactions
            const confirmationMessage = await interaction.reply({
                content: `✅ L'item "${itemName}" a été ajouté avec succès dans la base de données et le cache.`,
                ephemeral: true,
                fetchReply: true, // Permet de récupérer le message pour ajouter des réactions
            });
        } catch (error) {
            Logger.error(`Erreur lors de l'ajout de l'item : ${error.message}`);
            interaction.reply({
                content: "❌ Une erreur est survenue lors de l'ajout de l'item.",
                ephemeral: true,
            });
        }
    },
};