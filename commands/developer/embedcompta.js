const { ApplicationCommandOptionType } = require('discord.js');
const Logger = require('../../utils/Logger');

async function extractRowFromEmbed(embed, client) {
    // Extraction des fields en objet
    const fields = Object.fromEntries(
        (embed.fields || []).map(e => [e.name.replace(':', '').trim(), e.value])
    );

    // Date (préférence au field, sinon timestamp du message/embed)
    let date = fields["Date du vouch"] || fields["Vouch date"] ||
        (embed.timestamp ? new Date(embed.timestamp).toLocaleDateString('fr-FR') : "");
    if (typeof date === "string" && date.includes(" ")) {
        date = date.split(" ")[0];
    }
    const vouchId = fields["Vouch N°"] || fields["Vouch #"] || "";
    const buyerId = (fields["Vouch par"] || fields["Vouch by"] || "").match(/<@!?(\d+)>/)?.[1] || "";

    // Résolution Discord tag
    let buyerTag = "";
    if (buyerId) {
        try {
            let user = client.users.cache.get(buyerId);
            if (!user) user = await client.users.fetch(buyerId).catch(() => null);
            buyerTag = user ? user.tag : "";
        } catch (e) {
            buyerTag = "";
        }
    }

    // Modèle de row
    let row = {
        Date: date,
        Type: "",
        "Discord ID": buyerId,
        "Discord Tag": buyerTag,
        "Vouch N°": vouchId,
        "From": "",
        "MO": "",
        "To": "",
        "MD": "",
        "Frais": "",
        "Items": "",
        "Quantité": "",
        "Prix unité": "",
        "Prix de vente": "",
        "Prix d'achat": "",
        "CA": "",
        "Vendor": fields["Vendeur"] || fields["Vendor"] || ""
    };

    // Analyse Exchange / Vente
    if (fields["Exchange"]) {
        row.Type = "Exchange";
        const pattern = /([\d.,]+)€ de ([^ ]+) vers ([\d.,]+)€ en (.+)/i;
        const match = fields["Exchange"].match(pattern);
        if (match) {
            row.From = match[2].trim();
            row.MO = match[1].replace(',', '.');
            row.To = match[4].trim();
            row.MD = match[3].replace(',', '.');
            if (row.From.toLowerCase() === "paysafecard") {
                row.Frais = (parseFloat(row.MO) * 0.05).toFixed(2);
            }
        }
    } else if (fields["Item vendu"] || fields["Item sold"]) {
        row.Type = "Vente";
        const itemField = fields["Item vendu"] || fields["Item sold"];
        if (itemField) {
            let cleanItemField = itemField.replace(/^(Item vendu\s*:?|Item sold\s*:?)/, '').trim();
            const ventePattern = /(\d+)\s*x\s*(.*?)\s*\(?([\d.,]+)€\s*via\s*([^)\s]+)/i;
            const match = cleanItemField.match(ventePattern);

            if (match) {
                row.Quantité = match[1].trim();
                row.Items = match[2].trim();
                row["Prix de vente"] = match[3].replace(',', '.');
                row.To = match[4].trim();
                const quantite = parseInt(row.Quantité);
                const prixTotal = parseFloat(row["Prix de vente"]);
                if (!isNaN(quantite) && !isNaN(prixTotal) && quantite > 0) {
                    row["Prix unité"] = (prixTotal / quantite).toFixed(2);
                    row.CA = prixTotal.toFixed(2);
                }
            }
        }
    }
    return row;
}

async function getTransactionsByDate(channel, date) {
    const transactions = [];
    let lastMessageId;
    let hasMore = true;

    while (hasMore) {
        const options = { limit: 100 };
        if (lastMessageId) options.before = lastMessageId;

        const messages = await channel.messages.fetch(options).catch(err => {
            Logger.error(`Erreur récupération messages: ${err.message}`);
            return null;
        });

        if (!messages || messages.size === 0) {
            hasMore = false;
            break;
        }

        for (const message of messages.values()) {
            if (message.embeds && message.embeds.length > 0) {
                for (const embed of message.embeds) {
                    const row = await extractRowFromEmbed(embed, channel.client);
                    if (row.Date === date) {
                        transactions.push({
                            ...row,
                            messageId: message.id,
                            messageUrl: message.url
                        });
                    }
                }
            }
        }

        lastMessageId = messages.last()?.id;
        if (messages.size < 100) hasMore = false;
    }

    return transactions.sort((a, b) => a.messageId.localeCompare(b.messageId));
}

async function calculateDailyCA(transactions) {
    let totalCA = 0;
    let totalVentes = 0;
    let totalExchanges = 0;
    let totalFrais = 0;
    const ventesByItem = {};
    const exchangesByMethod = {};
    const vendorsStats = {};

    transactions.forEach(transaction => {
        if (transaction.Type === "Vente") {
            totalVentes++;
            const ca = parseFloat(transaction.CA) || 0;
            totalCA += ca;

            // Stats par item
            const item = transaction.Items || "Autre";
            ventesByItem[item] = (ventesByItem[item] || 0) + ca;

            // Stats par vendeur
            const vendor = transaction.Vendor || "Inconnu";
            vendorsStats[vendor] = {
                count: (vendorsStats[vendor]?.count || 0) + 1,
                ca: (vendorsStats[vendor]?.ca || 0) + ca
            };
        } else if (transaction.Type === "Exchange") {
            totalExchanges++;
            const frais = parseFloat(transaction.Frais) || 0;
            totalFrais += frais;

            // Stats par méthode
            const method = transaction.From || "Autre";
            exchangesByMethod[method] = (exchangesByMethod[method] || 0) + 1;
        }
    });

    return {
        totalCA: totalCA.toFixed(2),
        totalVentes,
        totalExchanges,
        totalFrais: totalFrais.toFixed(2),
        ventesByItem,
        exchangesByMethod,
        vendorsStats,
        transactionsCount: transactions.length
    };
}

module.exports = {
    name: "embedcompta",
    category: "developer",
    permissions: ['DEVELOPER'],
    usage: "embedcompta <date>",
    examples: ["embedcompta 01/01/2023"],
    description: "Liste toutes les transactions pour une date spécifique",
    options: [
        {
            name: "embed",
            description: "Extraire les données d'un embed spécifique",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "message_id",
                    description: "ID du message contenant l'embed",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: "date",
            description: "Liste toutes les transactions pour une date spécifique",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "date",
                    description: "Date des transactions (format: JJ/MM/AAAA)",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: "ca",
            description: "Calcule le chiffre d'affaires pour une date",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "date",
                    description: "Date pour le calcul du CA (format: JJ/MM/AAAA)",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        }
    ],
    async runInteraction(client, interaction) {
        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.channel;

        try {
            if (subcommand === "embed") {
                const messageId = interaction.options.getString('message_id');
                const message = await channel.messages.fetch(messageId).catch(() => null);

                if (!message || !message.embeds || message.embeds.length === 0) {
                    return interaction.reply({ content: "Aucun embed trouvé avec cet ID.", ephemeral: true });
                }

                const embed = message.embeds[0].data || message.embeds[0];
                const row = await extractRowFromEmbed(embed, client);

                let resultMessage;
                if (row.Type === "Exchange") {
                    resultMessage = `
**Informations d'échange extraites :**
- **Type** : ${row.Type}
- **Date** : ${row.Date}
- **De** : ${row.From} (${row.MO}€)
- **Vers** : ${row.To} (${row.MD}€)
- **Frais** : ${row.Frais || '0'}€
- **Vouch N°** : ${row["Vouch N°"]}
- **Acheteur** : ${row["Discord Tag"] || row["Discord ID"] || 'Non spécifié'}
`;
                } else if (row.Type === "Vente") {
                    resultMessage = `
**Informations de vente extraites :**
- **Type** : ${row.Type}
- **Date** : ${row.Date}
- **Vendeur** : ${row.Vendor || 'Non spécifié'}
- **Acheteur** : ${row["Discord Tag"] || row["Discord ID"] || 'Non spécifié'}
- **Item** : ${row.Items}
- **Quantité** : ${row.Quantité}
- **Prix unitaire** : ${row["Prix unité"] || '0'}€
- **Prix total** : ${row["Prix de vente"] || '0'}€
- **Méthode de paiement** : ${row.To || 'Non spécifiée'}
- **Vouch N°** : ${row["Vouch N°"]}
`;
                } else {
                    resultMessage = "Type de transaction non reconnu.";
                }

                await interaction.reply({ content: resultMessage, ephemeral: true });

            } else if (subcommand === "date") {
                const date = interaction.options.getString('date');
                await interaction.deferReply({ ephemeral: true });

                const transactions = await getTransactionsByDate(channel, date);

                if (transactions.length === 0) {
                    return await interaction.editReply(`Aucune transaction trouvée pour la date ${date}.`);
                }

                let resultMessage = `**Transactions pour le ${date}** (${transactions.length} résultats):\n\n`;

                transactions.forEach((transaction, index) => {
                    if (transaction.Type === "Exchange") {
                        resultMessage += `
**${index + 1}. Échange** [Lien](${transaction.messageUrl})
- **Date** : ${transaction.Date}
- **De** : ${transaction.From} (${transaction.MO}€)
- **Vers** : ${transaction.To} (${transaction.MD}€)
- **Frais** : ${transaction.Frais || '0'}€
- **Vouch N°** : ${transaction["Vouch N°"]}
- **Acheteur** : ${transaction["Discord Tag"] || transaction["Discord ID"] || 'Non spécifié'}
`;
                    } else if (transaction.Type === "Vente") {
                        resultMessage += `
**${index + 1}. Vente** [Lien](${transaction.messageUrl})
- **Date** : ${transaction.Date}
- **Vendeur** : ${transaction.Vendor || 'Non spécifié'}
- **Acheteur** : ${transaction["Discord Tag"] || transaction["Discord ID"] || 'Non spécifié'}
- **Item** : ${transaction.Items}
- **Quantité** : ${transaction.Quantité}
- **Prix unitaire** : ${transaction["Prix unité"] || '0'}€
- **Prix total** : ${transaction["Prix de vente"] || '0'}€
- **Méthode de paiement** : ${transaction.To || 'Non spécifiée'}
- **Vouch N°** : ${transaction["Vouch N°"]}
`;
                    }
                });

                if (resultMessage.length > 2000) {
                    const chunks = [];
                    while (resultMessage.length > 0) {
                        const chunk = resultMessage.substring(0, 2000);
                        chunks.push(chunk);
                        resultMessage = resultMessage.substring(2000);
                    }

                    for (const [index, chunk] of chunks.entries()) {
                        if (index === 0) {
                            await interaction.editReply(chunk);
                        } else {
                            await interaction.followUp({ content: chunk, ephemeral: true });
                        }
                    }
                } else {
                    await interaction.editReply(resultMessage);
                }

            } else if (subcommand === "ca") {
                const date = interaction.options.getString('date');
                await interaction.deferReply({ ephemeral: true });

                const transactions = await getTransactionsByDate(channel, date);
                const dailyStats = await calculateDailyCA(transactions);

                if (transactions.length === 0) {
                    return await interaction.editReply(`Aucune transaction trouvée pour le ${date}.`);
                }

                // Création d'un tableau récapitulatif des vendeurs
                const topVendors = Object.entries(dailyStats.vendorsStats)
                    .sort((a, b) => b[1].ca - a[1].ca)
                    .slice(0, 5)
                    .map(([vendor, stats]) => `  - ${vendor}: ${stats.count} ventes (${stats.ca.toFixed(2)}€)`)
                    .join('\n');

                const resultMessage = `
**Chiffre d'affaires pour le ${date}**

**Résumé global :**
- Transactions totales : ${dailyStats.transactionsCount}
- Ventes : ${dailyStats.totalVentes}
- Échanges : ${dailyStats.totalExchanges}
- CA total : ${dailyStats.totalCA} €
- Frais totaux : ${dailyStats.totalFrais} €

**Top 5 des items vendus :**
${Object.entries(dailyStats.ventesByItem)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([item, ca]) => `  - ${item}: ${ca.toFixed(2)} €`)
                        .join('\n') || 'Aucun item enregistré'}

**Top 5 des vendeurs :**
${topVendors || 'Aucun vendeur enregistré'}

**Méthodes d'échange les plus utilisées :**
${Object.entries(dailyStats.exchangesByMethod)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([method, count]) => `  - ${method}: ${count} échanges`)
                        .join('\n') || 'Aucun échange enregistré'}
`;

                if (resultMessage.length > 2000) {
                    const chunks = [];
                    while (resultMessage.length > 0) {
                        const chunk = resultMessage.substring(0, 2000);
                        chunks.push(chunk);
                        resultMessage = resultMessage.substring(2000);
                    }

                    for (const [index, chunk] of chunks.entries()) {
                        if (index === 0) {
                            await interaction.editReply(chunk);
                        } else {
                            await interaction.followUp({ content: chunk, ephemeral: true });
                        }
                    }
                } else {
                    await interaction.editReply(resultMessage);
                }
            }
        } catch (error) {
            console.error('Erreur dans runInteraction:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: `Une erreur est survenue: ${error.message}`,
                    ephemeral: true
                });
            } else {
                await interaction.editReply(`Une erreur est survenue: ${error.message}`);
            }
        }
    }
};
