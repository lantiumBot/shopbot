// utils/handlers/handleTicketClosure.js

const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const { LOG_TICKET_CHANNEL_ID } = require('../../ids');


function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}`;
}

async function fetchAllMessages(channel) {
    let messages = [];
    let lastMessageId;

    while (true) {
        const fetchedMessages = await channel.messages.fetch({
            limit: 100,
            before: lastMessageId
        });
        if (fetchedMessages.size === 0) break;

        messages = messages.concat(Array.from(fetchedMessages.values()));
        lastMessageId = fetchedMessages.last().id;
    }

    return messages.reverse(); // On renverse pour avoir les messages dans l'ordre chronologique
}

async function handleTicketClosure(client, source, ticketNumber) {
    try {
        const channel = source.channel;
        // Récupérer le serveur cible par son ID
        const logChannel = await channel.guild.channels.cache.get(LOG_TICKET_CHANNEL_ID);


        if (!logChannel) {
            return source.reply({
                content: "Erreur : Salon de logs introuvable.",
                ephemeral: true,
            });
        }

        // Déterminer si l'appel provient d'une interaction ou d'un message
        const user = source.user || source.author;

        // Récupération de tous les messages
        const messages = await fetchAllMessages(channel);
        const logDataArray = messages.map((msg) => {
            const attachments = msg.attachments.map(att => att.url).join('\n');
            return `[${formatDate(msg.createdAt)}] ${msg.author.tag}: ${msg.content}${attachments ? `\nAttachments:\n${attachments}` : ''}`;
        });
        const messageCount = logDataArray.length;

        // Compte des messages par utilisateur
        const messageStats = messages.reduce((acc, msg) => {
            acc[msg.author.tag] = (acc[msg.author.tag] || 0) + 1;
            return acc;
        }, {});

        const messageSummary = Object.entries(messageStats)
            .map(([author, count]) => `- Messages de ${author} : ${count}`)
            .join("\n");

        // Création de l'en-tête et du pied de page
        const ticketType = channel.name.split('-')[0]; // Type du ticket
        const header = `
==============================================================
LOG DU TICKET - Rapport détaillé - Vouch ${ticketNumber || "Aucun"}
==============================================================
Channel: ${channel.parent?.name || "Aucune catégorie"} / ${channel.name}
Ouvert par: ${channel.topic?.replace("Ticket ouvert par ", "") || "Inconnu"}
Heure d'ouverture: ${formatDate(channel.createdAt)}
Heure de fermeture: ${formatDate(new Date())}
==============================================================
`.trim();

        const footer = `
==============================================================
Résumé :
${messageSummary}

Exported ${messageCount} message(s)
==============================================================
`.trim();

        const logData = `${header}\n\n${logDataArray.join("\n")}\n\n${footer}`;

        // Ajout d'un timestamp unique au fichier log
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const logFilePath = path.join(__dirname, `logs-${channel.name}-${timestamp}.log`);
        fs.writeFileSync(logFilePath, logData, { encoding: 'utf8' });

        // Création d'un embed pour les logs
        const embed = new EmbedBuilder()
            .setTitle(`📝 Logs du ticket fermé : ${channel.name} - Vouch ${ticketNumber || "Aucun"}`)
            .setDescription(`Le ticket a été fermé par <@${user.id}>. Les logs sont disponibles ci-dessous.`)
            .setColor("Red")
            .setTimestamp();

        // Envoi des logs
        await logChannel.send({
            embeds: [embed],
            files: [logFilePath],
        });

        // Suppression du fichier temporaire après envoi
        fs.unlinkSync(logFilePath);

        await channel.send("Ticket fermé. Les logs ont été envoyés dans le salon des logs.");
        setTimeout(() => channel.delete(), 1000); // Ajout d'un délai pour éviter les conflits
    } catch (error) {
        console.error(`[ERROR] Erreur lors de la fermeture du ticket : ${error.message}`);
        await source.reply({
            content: "Une erreur est survenue lors de la fermeture du ticket.",
            ephemeral: true,
        });
    }
}


module.exports = {
    handleTicketClosure,
};
