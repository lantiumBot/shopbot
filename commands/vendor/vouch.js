const {
    ApplicationCommandOptionType,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const Logger = require("../../utils/Logger");
const getMessage = require("../../utils/getMessage"); // Ajoute cette ligne si pas déjà fait
const {
    BUYER_ROLE_ID,
    VOUCH_CATEGORY_ID,
    REPUTATION_CHANNEL_ID,
} = require("../../ids");

module.exports = {
    name: "vouch",
    category: "vendor",
    permissions: ["VENDOR", "STAFF"],
    usage: "vouch vente / exchange",
    examples: ["vouch vente", "vouch exchange"],
    description: "Permet d'afficher le message de fin d'un ticket",
    options: [
        {
            name: "choices",
            description: "merci de choisir entre vente ou exchange",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "Vente",
                    value: "vente",
                },
                {
                    name: "Exchange",
                    value: "exchange",
                },
            ],
        },
        {
            name: "lang",
            description: "Choisissez la langue d'affichage de l'embed",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: "Français", value: "fr" },
                { name: "English", value: "en" },
            ],
        },
        {
            name: "item",
            description: "L'item pour lequel vous souhaitez faire une vouch",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: "Nitro", value: "Nitro" },
                { name: "Déco", value: "Déco" },
                { name: "Account", value: "Account" },
                { name: "Exchange", value: "Exchange" },
                { name: "Boost", value: "Boost" },
                { name: "Autre", value: "Autre" },
            ],
        },
        {
            name: "buyer",
            description: "Merci de mentionner le client pour lui ajouter le rôle buyer",
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],
    async runInteraction(client, interaction) {
        const channel = interaction.channel;
        const choice = interaction.options.getString("choices");
        const buyer = interaction.options.getUser("buyer");
        const item = interaction.options.getString("item");
        // Récupère la langue si spécifiée, sinon prend la locale du client ou 'fr' par défaut
        const lang = interaction.options.getString("lang") || interaction.locale || "fr";

        if (!choice) {
            return interaction.reply({
                content: getMessage('vouchNoChoice', lang),
                ephemeral: true,
            });
        }

        // Rename channel if item is provided
        if (item) {
            try {
                const newName = `attente-vouch-${item.toLowerCase()}`;
                await channel.setName(newName);
                Logger.info(`Channel renamed to ${newName}`);
            } catch (error) {
                Logger.error(`Error renaming channel: ${error.message}`);
                return interaction.reply({
                    content: getMessage('vouchRenameError', lang),
                    ephemeral: true,
                });
            }
        }

        // Récupérer les permissions actuelles avant de déplacer le salon
        const currentPermissions = channel.permissionOverwrites.cache;
        const permissionsToReapply = Array.from(currentPermissions.values()).map(
            (permission) => ({
                id: permission.id,
                allow: permission.allow.bitfield,
                deny: permission.deny.bitfield,
            })
        );

        // Déplacer le salon vers la catégorie spécifiée
        await channel.setParent(VOUCH_CATEGORY_ID);

        // Réappliquer les permissions existantes après le déplacement
        for (const permission of permissionsToReapply) {
            try {
                await channel.permissionOverwrites.edit(permission.id, {
                    ViewChannel: permission.allow & PermissionFlagsBits.ViewChannel ? true : false,
                    SendMessages: permission.allow & PermissionFlagsBits.SendMessages ? true : false,
                    ReadMessageHistory: permission.allow & PermissionFlagsBits.ReadMessageHistory ? true : false,
                });
            } catch (error) {
                Logger.error(
                    `Erreur lors de la réapplication des permissions pour l'ID ${permission.id}: ${error.message}`
                );
            }
        }

        // Ajouter les permissions pour l'utilisateur qui a ouvert le ticket
        const ticketCreator = permissionsToReapply.find(
            (p) =>
                p.id !== interaction.guild.id &&
                p.id !== client.user.id &&
                p.allow & PermissionFlagsBits.ViewChannel
        );

        if (ticketCreator) {
            try {
                await channel.permissionOverwrites.edit(ticketCreator.id, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    AttachFiles: true,
                    EmbedLinks: true,
                });
            } catch (error) {
                Logger.error(
                    `Erreur lors de l'ajout des permissions pour le créateur du ticket: ${error.message}`
                );
            }
        }

        const vouchCommand = choice === "vente" ? "/rep vente" : "/rep exchange";
        const embed = new EmbedBuilder()
            .setColor("DarkPurple")
            .setDescription(
                getMessage('vouchSuccessDesc', lang, vouchCommand, REPUTATION_CHANNEL_ID)
            );

        try {
            if (buyer) {
                // Ajoute le rôle "buyer" à l'utilisateur buyer
                const guildMember = await interaction.guild.members.fetch(buyer.id);
                await guildMember.roles.add(BUYER_ROLE_ID);
            }
        } catch (error) {
            Logger.error(`Error adding Buyer role: ${error.message}`);
        }

        try {
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            Logger.error(`Error executing vouch command: ${error.message}`, {
                label: "Vouch Command",
            });
            return interaction.reply({
                content: getMessage('vouchCommandError', lang),
                ephemeral: true,
            });
        }
    },
};
