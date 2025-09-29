const { ApplicationCommandOptionType } = require('discord.js');
const Logger = require('../../utils/Logger');
const getMessage = require('../../utils/getMessage');
const {
    RESERVATION_PARENT_ID,
    RESERVATION_LOG_CHANNEL_ID,
} = require("../../ids");

module.exports = {
    name: "reservation",
    category: "vendor",
    permissions: ['STAFF', 'VENDOR'],
    usage: "reservation [nombre] [paiement methode]",
    examples: ["reservation 2 PayPal", "reservation 1 Crypto"],
    description: "Réserve un ou plusieurs items pour un client dans le système de réservation.",
    options: [
        {
            name: "membre",
            description: "Mentionnez le membre à réserver.",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "nombre",
            description: "Le nombre d'items à réserver.",
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
        {
            name: "paiement",
            description: "La méthode de paiement (PayPal, Crypto, etc.).",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "PayPal", value: "PayPal" },
                { name: "Crypto", value: "Crypto" },
                { name: "Paysafecard", value: "Paysafecard" },
                { name: "Revolut", value: "Revolut" },
            ],
        },
        {
            name: "lang",
            description: "Langue de la réponse",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: "Français", value: "fr" },
                { name: "English", value: "en" },
            ],
        }
    ],
    async runInteraction(client, interaction) {
        const channel = interaction.channel;
        const member = interaction.options.getUser('membre');
        const nombre = interaction.options.getInteger('nombre');
        const paiement = interaction.options.getString('paiement');
        const lang =
            interaction.options.getString('lang') ||
            (interaction.locale?.startsWith("fr") ? "fr" : "en");

        try {
            // get member 
            const guildMember = await interaction.guild.members.fetch(member.id).catch(() => null);
            if (!guildMember) {
                return interaction.reply({ content: getMessage('reservationMemberNotFound', lang), ephemeral: true });
            }

            // Renommer le salon
            await channel.setName(`reservation-${nombre}x-nb`);

            // Déplacer le salon
            const currentPermissions = channel.permissionOverwrites.cache;
            await channel.setParent(RESERVATION_PARENT_ID);

            for (const [id, permission] of currentPermissions.entries()) {
                // Ignorer les permissions pour @everyone (ID du serveur)
                if (id === interaction.guild.id) continue;
                try {
                    await channel.permissionOverwrites.edit(id, {
                        allow: permission.allow.bitfield,
                        deny: permission.deny.bitfield,
                    });
                } catch (error) {
                    Logger.error(`Erreur lors de la réapplication des permissions pour l'ID ${id} : ${error.message}`);
                }
            }

            const reservationLogChannel = await client.channels.fetch(RESERVATION_LOG_CHANNEL_ID).catch(() => null);
            if (!reservationLogChannel) {
                return interaction.reply({ content: getMessage('reservationLogNotFound', lang), ephemeral: true });
            }
            if (reservationLogChannel.isTextBased()) {
                await reservationLogChannel.send(
                    getMessage('reservationLog', lang, guildMember.id, nombre, paiement)
                );
            }
            await interaction.reply({ content: getMessage('reservationSaved', lang) });
        } catch (error) {
            Logger.error(error);
            await interaction.reply({ content: getMessage('reservationError', lang), ephemeral: true });
        }
    },
};
