const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const Logger = require("../../utils/Logger");
const RepData = require("../../models/rep");
const SaleData = require("../../models/sale");
const updateLeaderboard = require("../../utils/handlers/updateLeaderboard");
const getMessage = require("../../utils/getMessage");

// Constantes
const VENDOR_ROLE_ID = "1353052847096467607";
const Lantium = "756338300259664012";

// Dictionnaire de correction d'ID pour les vendeurs
const idCorrections = {
    "756338300259664012": "756338300259664012", // Lantium
};

// Cartes pour les catégories et moyens de paiement
const categoryMap = {
    "Nitro Boost": "Nitro Boost",
    Décoration: "Décoration Profil",
    Exchange: "Échange",
    "Server Boost 1 mois": "Server Boost 1 Mois",
    "server boost 3 mois": "Server Boost 3 Mois",
    "Account Discord 2016": "Account Discord 2016",
    "Account Discord 2017": "Account Discord 2017",
    "Account Discord 2018": "Account Discord 2018",
    "Account Discord 2019": "Account Discord 2019",
    "Account Discord 2020": "Account Discord 2020",
};

const paymentMap = {
    Paypal: "PayPal",
    Crypto: "Crypto",
    LTC: "Litecoin",
    Paysafecard: "Paysafecard",
    Revolut: "Revolut",
};

module.exports = {
    name: "testembed",
    category: "util",
    permissions: ["DEVELOPER"],
    usage: "/testembed [vendeur] [quantité] [item] [prix] [moyen-de-paiement]",
    examples: ["/testembed @Yubikey 3 'Décoration' 5 'PayPal'"],
    description: "Ajoute un testembed à un vendeur et catégorise l'item.",
    options: [
        {
            name: "vendeur",
            description: "Le vendeur à qui ajouter un rep.",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "quantité",
            description: "La quantité d'items vendus (exemple : 3 ou 3k).",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "item",
            description: "L'item vendu (exemple : Décoration, Exchange, etc.).",
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: "Nitro Boost", value: "Nitro Boost" },
                { name: "Décoration Profil", value: "Décoration" },
                { name: "Échange", value: "Exchange" },
                { name: "Server Boost 1 Mois", value: "Server Boost 1 mois" },
                { name: "Server Boost 3 Mois", value: "server boost 3 mois" },
                { name: "Account Discord 2016", value: "Account Discord 2016" },
                { name: "Account Discord 2017", value: "Account Discord 2017" },
                { name: "Account Discord 2018", value: "Account Discord 2018" },
                { name: "Account Discord 2019", value: "Account Discord 2019" },
                { name: "Account Discord 2020", value: "Account Discord 2020" },
            ],
            required: true,
        },
        {
            name: "prix",
            description: "Le prix de l'item (exemple : 5).",
            type: ApplicationCommandOptionType.Number,
            required: true,
        },
        {
            name: "moyen-de-paiement",
            description: "Le moyen de paiement utilisé (exemple : PayPal, Crypto).",
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: "PayPal", value: "Paypal" },
                { name: "Crypto", value: "Crypto" },
                { name: "Litecoin", value: "LTC" },
                { name: "Paysafecard", value: "Paysafecard" },
                { name: "Revolut", value: "Revolut" },
            ],
            required: true,
        },
        {
            name: "evaluation",
            description: "Evaluer la vente (mettre un chiffre entre 1 et 5)",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "commentaire",
            description: "Ajouter un commentaire à la vente",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    async runInteraction(client, interaction) {
        try {
            // Validation du canal
            // if (interaction.channel.id !== "1353052998275960912") {
            //     return interaction.reply({
            //         content: "❌ Cette commande ne peut être utilisée que dans le canal #reps.",
            //         ephemeral: true,
            //     });
            // }

            // Récupération des options
            const vendeur = interaction.options.getUser("vendeur");
            const quantityInput = interaction.options
                .getString("quantité")
                .toLowerCase();
            const itemInput = interaction.options.getString("item");
            const price = interaction.options.getNumber("prix");
            const paymentInput = interaction.options.getString("moyen-de-paiement");
            let evaluationInput = interaction.options.getString("evaluation");
            const commentInput = interaction.options.getString("commentaire");

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

            // Extraction de la quantité
            const quantityMatch = quantityInput.match(/(\d+(?:[.,]\d+)?)([kKmM]?)/);
            let quantity = 1;
            if (quantityMatch) {
                quantity = parseFloat(quantityMatch[1].replace(",", "."));
                const suffix = quantityMatch[2].toLowerCase();
                if (suffix === "k") {
                    quantity *= 1000;
                } else if (suffix === "m") {
                    quantity *= 1000000;
                }
            }

            // Validation du prix
            if (!price || price <= 0) {
                return interaction.reply({
                    content: "❌ Le prix doit être un nombre positif.",
                    ephemeral: true,
                });
            }

            // Limiter à deux décimales
            const decimalPlaces = (price.toString().split(".")[1] || "").length;
            if (decimalPlaces > 2) {
                return interaction.reply({
                    content: "❌ Le prix doit avoir au maximum deux décimales.",
                    ephemeral: true,
                });
            }

            // Catégorisation de l'item
            const item = categoryMap[itemInput];
            if (!item) {
                return interaction.reply({
                    content:
                        "❌ Impossible de catégoriser l'item. Merci d'utiliser une valeur valide.",
                    ephemeral: true,
                });
            }

            // Mise à jour du leaderboard
            await updateLeaderboard(client);

            // récupérer evaluationInput et vérifier qu'il est compris entre 1 et 5
            evaluationInput = evaluationInput ? parseInt(evaluationInput[0]) : 5;
            if (isNaN(evaluationInput) || evaluationInput < 1 || evaluationInput > 5) {
                evaluationInput = 5;
            }

            const stars = "⭐".repeat(evaluationInput);

            // récupère le timestamp actuel en heure française
            const date = new Date();
            const options = { timeZone: "Europe/Paris", hour12: false };
            const time = date.toLocaleTimeString("fr-FR", options);

            const embed = new EmbedBuilder()

                .setTitle(`Nouvelle Vouch de ${interaction.user.username}`)
                .setColor("#2ECC71")
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(stars)
                .addFields(
                    { name: "Vouch:", value: `${quantity} x ${item}`, inline: false },
                    {
                        name: "Prix:",
                        value: `${price}€ (${paymentMap[paymentInput]})`,
                        inline: false,
                    },
                    { name: "Vouch N°:", value: "1", inline: true },
                    {
                        name: "Vouch par:",
                        value: `<@${interaction.user.id}>`,
                        inline: true,
                    },
                    { name: "Date du vouch:", value: time, inline: true }
                )
                .setFooter({ text: getMessage("ShopFooter", lang) })
                .setTimestamp();

            if (commentInput) {
                embed.addFields({ name: "Commentaire:", value: commentInput, inline: false });
            }

            // Réponse finale
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            Logger.error(
                `Erreur lors de l'exécution de la commande /testembed : ${error.message}`
            );
            interaction.reply({
                content:
                    "❌ Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer.",
                ephemeral: true,
            });
        }
    },
};
