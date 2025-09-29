const {
    PermissionsBitField,
    ChannelType,
    EmbedBuilder,
} = require("discord.js");
const { CATEGORY_TICKET_ID, STAFF_ROLE_ID } = require('../../ids');
const getMessage = require('../getMessage');

async function handleTicketCreation(client, interaction, customId) {
    // Ajout de langage dynamique (stocke le minimum ici)
    const ticketTypeMap = {
        open_ticket_fr: {
            type: "Vente",
            emoji: "🇫🇷",
        },
        open_ticket_en: {
            type: "Sale",
            emoji: "🇬🇧",
        }
    };

    const ticketInfo = ticketTypeMap[customId];
    if (!ticketInfo) {
        return interaction.reply({
            content: getMessage('ticketUnknownType', interaction.locale),
            ephemeral: true,
        });
    }

    // Utilise la langue du client
    const locale = interaction.locale;

    const { type: ticketType, emoji: ticketEmoji } = ticketInfo;

    const permissionOverwrites = [
        {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
            id: interaction.user.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.AttachFiles,
                PermissionsBitField.Flags.AddReactions
            ],
        },
        {
            id: STAFF_ROLE_ID,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.AttachFiles,
                PermissionsBitField.Flags.AddReactions
            ],
        }
    ];

    let ticketChannel;
    try {
        const channelName = ticketEmoji
            ? `${ticketEmoji}-${ticketType}-${interaction.user.username}`
            : `Vente-${interaction.user.username}`;

        ticketChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: CATEGORY_TICKET_ID,
            topic: `Ticket ouvert par ${interaction.user.tag} (${locale})`,
            permissionOverwrites,
        });
    } catch (error) {
        console.error(`[ERROR] Impossible de créer le salon : ${error.message}`);
        return interaction.reply({
            content: getMessage('ticketErrorCreating', locale),
            ephemeral: true,
        });
    }

    if (!ticketChannel) {
        console.error("[ERROR] Le salon n'a pas été créé.");
        return interaction.reply({
            content: getMessage('ticketChannelNotCreated', locale),
            ephemeral: true,
        });
    }

    const embed = new EmbedBuilder()
        .setTitle(`${ticketEmoji || ''} **Ticket ouvert par ${interaction.user.tag}**`)
        .setDescription(getMessage('ticketEmbedDescription', locale))
        .setColor("White")
        .setFooter({ text: getMessage('ticketFooter', locale) });

    try {
        await ticketChannel.send({
            content: `<@&${STAFF_ROLE_ID}> ${getMessage('ticketWait', locale)}`,
            embeds: [embed],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 4,
                            label: getMessage('closeTicketButton', locale),
                            customId: "close_ticket",
                        },
                    ],
                },
            ],
        });

        await ticketChannel.send({
            content: getMessage('ticketPaymentMethods', locale),
        });

        await interaction.reply({
            content: getMessage('ticketCreatedMessage', locale, ticketType, ticketChannel.id),
            ephemeral: true,
        });
    } catch (error) {
        console.error(
            `[ERROR] Impossible d'envoyer un message dans le salon : ${error.message}`
        );
        return interaction.reply({
            content: getMessage('ticketSendError', locale),
            ephemeral: true,
        });
    }
}

module.exports = handleTicketCreation;
