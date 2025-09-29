const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Logger = require('../../utils/Logger');

const STOCK_FILE = path.join(__dirname, '../../data/stockAccount.json');

function readStock() {
    if (!fs.existsSync(STOCK_FILE)) {
        fs.writeFileSync(STOCK_FILE, JSON.stringify({}, null, 2), 'utf8');
        return {};
    }
    return JSON.parse(fs.readFileSync(STOCK_FILE, 'utf8'));
}

function writeStock(data) {
    fs.writeFileSync(STOCK_FILE, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
    name: "stockaccount",
    category: "developer",
    permissions: ['DEVELOPER'],
    usage: "/stockaccount <add/send> <année> <informations>",
    examples: [
        "/stockaccount add 2024 'clé: valeur'",
        "/stockaccount send 2024"
    ],
    description: "Stocke ou envoie des informations liées à une année spécifique.",
    options: [
        {
            name: "action",
            description: "add pour stocker, send pour envoyer et supprimer",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "add", value: "add" },
                { name: "send", value: "send" },
                { name: "list", value: "list" }
            ]
        },
        {
            name: "annee",
            description: "L'année concernée",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "informations",
            description: "Les informations à stocker (obligatoire pour add)",
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],
    async runInteraction(client, interaction) {
        const action = interaction.options.getString('action');
        const annee = interaction.options.getString('annee');
        const informations = interaction.options.getString('informations');
        const stock = readStock();

        if (action === 'add') {
            if (!informations) {
                return interaction.reply({ content: "Veuillez fournir les informations à stocker.", ephemeral: true });
            }
            stock[annee] = informations;
            writeStock(stock);
            await interaction.reply({ content: `Informations stockées pour l'année ${annee}.`, ephemeral: true });
            Logger.info(`Stock ajouté pour ${annee} par ${interaction.user.tag}`);
        } else if (action === 'send') {
            if (!stock[annee]) {
                return interaction.reply({ content: `Aucune information trouvée pour l'année ${annee}.`, ephemeral: true });
            }
            const info = stock[annee];
            delete stock[annee];
            writeStock(stock);
            await interaction.reply({ content: `Informations pour ${annee} :\n${info}`, ephemeral: true });
            Logger.info(`Stock envoyé et supprimé pour ${annee} par ${interaction.user.tag}`);
        } else if (action === 'list') {
            const embed = new EmbedBuilder()
                .setTitle("Stock des comptes")
                .setDescription("Liste des informations stockées par année")
                .setColor("#0099ff");

            if (Object.keys(stock).length === 0) {
                embed.setDescription("Aucune information stockée.");
            } else {
                Object.entries(stock).forEach(([year, info]) => {
                    embed.addFields({ name: year, value: info });
                });
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });
            Logger.info(`Liste du stock demandée par ${interaction.user.tag}`);
        }
        else {
            await interaction.reply({ content: "Action inconnue.", ephemeral: true });
        }
    },
};