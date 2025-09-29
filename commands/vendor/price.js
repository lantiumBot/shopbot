const { EmbedBuilder } = require("discord.js");
const getMessage = require("../../utils/getMessage");

module.exports = {
    name: "price",
    category: "vendor",
    permissions: ["SendMessages"],
    usage: "Price [deco] [compte] [exchange] [boostserver]",
    examples: ["price", "price compte", "price deco", "price boostserver"],
    description: "Envoie les informations de prix de Lantium",
    async run(client, message, args) {
        message.delete();

        // Déclaration des informations de prix

        const prixNB = {
            "Nitro Boost TC": "3€"
        };

        const prixCompte = {
            "Informations": "Les comptes sont en Full Access avec OG Mail",
            "2015": "60€",
            "2016": "7€",
            "2017": "4€",
            "2018": "2.50€",
            "2019": "1.50€",
            "2020": "1€"
        };

        const prixDeco = {
            "4.99€": "2.90€",
            "5.99€": "3.80€",
            "6.99€": "4.10€",
            "7.99€": "5.10€",
            "8.49€": "5.60€",
            "9.99€": "6.60€",
            "11.99€": "7.30€"
        };

        const prixExchange = {
            "Paypal or CB to Crypto": {
                "-10€": "8% frais",
                "-20€": "6% frais",
                "+20€": "5% frais",
                "+50€": "4% frais"
            },
            "Crypto to Crypto": {
                "-10€": "8% frais",
                "-20€": "6% frais",
                "+20€": "5% frais",
                "+50€": "4% frais"
            },
            "Crypto to Paypal": "No Frais | Pourboires apprécié 😇",
            "Paysafecard to Paypal": "8% de frais",
            "Paysafecard to Crypto": "9% de frais"
        };

        // Modification de l'objet boostServer pour inclure les prix pour 1 mois et 3 mois
        const boostServer = {
            "x14": { "1 mois": "3.50€", "3 mois": "10.50" }
        };

        // Création de l'embed avec plus de lisibilité
        const embed = new EmbedBuilder()
            .setColor("#00b0f4")  // Couleur de l'embed
            .setTitle("💰 **Prix** 💰")
            .setDescription("Voici les informations des prix disponibles !")
            .setFooter({ text: getMessage("ShopFooter", "fr") })
            .setTimestamp();

        // Si aucun argument n'est donné, afficher tout
        if (args.length === 0) {
            embed.addFields(
                { name: "💻 **Comptes**", value: Object.entries(prixCompte).map(([key, value]) => `**${key}:** ${value}`).join("\n"), inline: false },
                { name: "🎨 **Décoration**", value: Object.entries(prixDeco).map(([key, value]) => `**${key}:** ${value}`).join("\n"), inline: false },
                { name: "🔄 **Exchange Frais**", value: `**Paypal to Crypto ou Crypto vers Crypto**\n${Object.entries(prixExchange["Paypal or CB to Crypto"]).map(([key, value]) => `**${key}:** ${value}`).join("\n")}\n\n**Crypto > Paypal**\n${prixExchange["Crypto to Paypal"]}\n\n**Paysafecard > Paypal**\n${prixExchange["Paysafecard to Paypal"]}\n\n**Paysafecard > Crypto**\n${prixExchange["Paysafecard to Crypto"]}`, inline: false }
            );
        } else {
            // Cas avec un argument
            const argument = args[0].toLowerCase();
            if (argument === "compte") {
                embed.addFields(
                    { name: "💻 **Comptes**", value: Object.entries(prixCompte).map(([key, value]) => `**${key}:** ${value}`).join("\n"), inline: false }
                );
            } else if (argument === "nb") {
                embed.addFields(
                    { name: "🎉 **Nitro Boost**", value: Object.entries(prixNB).map(([key, value]) => `**${key}:** ${value}`).join("\n"), inline: false }
                );
            } else if (argument === "deco") {
                embed.addFields(
                    { name: "🎨 **Décoration**", value: Object.entries(prixDeco).map(([key, value]) => `**${key}:** ${value}`).join("\n"), inline: false }
                );
            } else if (argument === "exchange") {
                embed.addFields(
                    { name: "🔄 **Exchange Frais**", value: `**Paypal to Crypto ou Crypto vers Crypto**\n${Object.entries(prixExchange["Paypal or CB to Crypto"]).map(([key, value]) => `**${key}:** ${value}`).join("\n")}\n\n**Crypto > Paypal**\n${prixExchange["Crypto to Paypal"]}\n\n**Paysafecard > Paypal**\n${prixExchange["Paysafecard to Paypal"]}\n\n**Paysafecard > Crypto**\n${prixExchange["Paysafecard to Crypto"]}`, inline: false }
                );
            } else if (argument === "boostserver") {
                // Afficher les prix pour 1 mois et 3 mois
                const boostInfo = Object.entries(boostServer)
                    .map(([key, value]) => `**${key} Boost**\n- 1 mois: ${value["1 mois"]}\n- 3 mois: ${value["3 mois"]}`)
                    .join("\n\n");
                embed.addFields(
                    { name: "🔥 **Boost Serveur**", value: boostInfo, inline: false }
                );
            } else {
                embed.setDescription("Argument inconnu. Utilise `nb`, `compte`, `deco`, `exchange` ou `boostserver`.");
            }
        }

        // Envoie de l'embed
        message.channel.send({ embeds: [embed] });
    },
};
