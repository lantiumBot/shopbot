const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const Logger = require("../../utils/Logger");
const RepData = require("../../models/rep");
const SaleData = require("../../models/sale");
const ExchangeData = require("../../models/exchange");
const updateLeaderboard = require("../../utils/handlers/updateLeaderboard");


// Dictionnaire de correction d'ID pour les vendeurs
const idCorrections = {
    "319912404135706634": "333314116817125376", // yubikey25
    "340957191718699038": "333314116817125376", // yubikeyxdev
    "333314116817125376": "333314116817125376", // yubiworld.
};

const VENDOR_ROLE_ID = "1391651513084018759";



module.exports = {
    name: "deleterep",
    category: "developer",
    permissions: ["DEVELOPER"],
    usage: "/deleterep [vendeur] [id-rep]",
    examples: ["/deleterep @Yubikey 123"],
    description: "Supprime une rep spécifique d'un vendeur.",
    options: [
        {
            name: "delete",
            description: "Supprime une rep spécifique d'un vendeur.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "vendeur",
                    description: "Le vendeur dont on veut supprimer une rep.",
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: "id-rep",
                    description: "L'ID de la rep à supprimer (numéro exact).",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                },
            ],
        },
    ],
    async runInteraction(client, interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            if (subcommand === "delete") {
                // Récupération des options pour la sous-commande 'delete'
                const vendeur = interaction.options.getUser("vendeur");
                const repId = interaction.options.getInteger("id-rep");

                // Correction de l'ID du vendeur si nécessaire
                const correctedVendorId = idCorrections[vendeur.id] || vendeur.id;

                // Vérification du rôle du vendeur
                const guildMember = await interaction.guild.members
                    .fetch(correctedVendorId)
                    .catch(() => null);
                if (!guildMember || !guildMember.roles.cache.has(VENDOR_ROLE_ID)) {
                    return interaction.reply({
                        content:
                            "❌ Ce vendeur ne fait pas partie de la liste des vendeurs du serveur.",
                        ephemeral: true,
                    });
                }

                // Recherche des données de reps pour ce vendeur
                let repData = await RepData.findOne({ userId: correctedVendorId });
                if (!repData) {
                    return interaction.reply({
                        content: "❌ Ce vendeur n'a aucune rep enregistrée.",
                        ephemeral: true,
                    });
                }

                // Récupérer toutes les ventes et échanges du vendeur
                const sales = await SaleData.find({ userId: correctedVendorId });
                const exchanges = await ExchangeData.find({ userId: correctedVendorId });

                // Chercher la vente ou l'échange correspondant à repId
                let saleToDelete = sales.find(sale => sale.rep === repId);
                let exchangeToDelete = exchanges.find(exchange => exchange.rep === repId);

                if (!saleToDelete && !exchangeToDelete) {
                    return interaction.reply({
                        content: "❌ L'ID de la rep spécifiée n'existe ni dans les ventes ni dans les échanges.",
                        ephemeral: true,
                    });
                }

                // Supprimer la vente ou l'échange correspondant
                if (saleToDelete) {
                    await SaleData.findByIdAndDelete(saleToDelete._id);
                } else if (exchangeToDelete) {
                    await ExchangeData.findByIdAndDelete(exchangeToDelete._id);
                }

                // Mise à jour des données de reps
                repData.rep -= 1;
                repData.totalSales -= saleToDelete.quantity; // Soustraire la quantité de cette vente
                await repData.save();

                // Mise à jour du leaderboard
                await updateLeaderboard(client);

                // Réponse finale
                await interaction.reply({ content: "OK", ephemeral: true });
            }
        } catch (error) {
            Logger.error(
                `Erreur lors de l'exécution de la commande /deleterep : ${error.message}`
            );
            interaction.reply({
                content:
                    "❌ Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer.",
                ephemeral: true,
            });
        }
    },
};