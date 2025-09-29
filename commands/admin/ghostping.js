const { ApplicationCommandOptionType } = require('discord.js');
const Logger = require('../../utils/Logger');

module.exports = {
    name: "ghostping",
    category: "admin",
    permissions: ['DEVELOPER', 'OWNERS'],
    usage: "/ghostping <mode> <target> [nombre]",
    examples: [
        "ghostping user @user 10",
        "ghostping role @role 5",
        "ghostping server"
    ],
    description: "Permet de lancer un ghostping sur un utilisateur, un rôle ou le serveur entier.",
    options: [
        {
            name: "mode",
            description: "Choisir le mode de ghostping (user, role, server)",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "User", value: "user" },
                { name: "Role", value: "role" },
                { name: "Server", value: "server" }
            ],
        },
        {
            name: "target",
            description: "Mentionner l'utilisateur, le rôle ou ignorer pour le mode serveur",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "nombre",
            description: "Choisir le nombre de messages à envoyer (user/role uniquement)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
    ],
    async runInteraction(client, interaction) {
        const mode = interaction.options.getString('mode');
        const targetInput = interaction.options.getString('target');
        const amount = interaction.options.getInteger('nombre') || 1;

        if (mode === "user" && (!targetInput || amount < 1)) {
            return interaction.reply({
                content: "Vous devez fournir un ou plusieurs utilisateurs et un nombre de messages supérieur à 0.",
                ephemeral: true,
            });
        }

        if (mode === "role" && (!targetInput || amount < 1)) {
            return interaction.reply({
                content: "Vous devez fournir un rôle et un nombre de messages supérieur à 0.",
                ephemeral: true,
            });
        }

        await interaction.reply({
            content: `Lancement du ghostping en mode **${mode}**.`,
            ephemeral: true,
        });

        try {
            let totalMessagesSent = 0;
            let totalUsersPinged = 0;

            if (mode === "user") {
                const userIds = targetInput.split(/\s+/).map(id => {
                    const mentionMatch = id.match(/^<@!?(\d+)>$/);
                    return mentionMatch ? mentionMatch[1] : id;
                });
                totalUsersPinged = userIds.length;

                const maxChars = 2000;
                const baseMessage = '*.* ||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||';
                let currentMessage = baseMessage;
                let chunks = [];

                for (const userId of userIds) {
                    const mention = `<@${userId}> `;
                    if (currentMessage.length + mention.length > maxChars) {
                        chunks.push(currentMessage);
                        currentMessage = baseMessage + mention;
                    } else {
                        currentMessage += mention;
                    }
                }
                if (currentMessage.length > baseMessage.length) chunks.push(currentMessage);

                for (let i = 0; i < amount; i++) {
                    for (const chunk of chunks) {
                        const message = await interaction.channel.send(chunk);
                        await message.delete();
                        totalMessagesSent++;
                    }
                }
            } else if (mode === "role") {
                const role = interaction.guild.roles.cache.get(targetInput) || interaction.options.getRole('target');
                if (!role) {
                    return interaction.followUp({ content: "Rôle non trouvé.", ephemeral: true });
                }

                const maxChars = 2000;
                const baseMessage = '*.* ||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||';
                let currentMessage = baseMessage;
                let chunks = [];
                const members = role.members.map(member => `<@${member.id}>`);
                totalUsersPinged = members.length;

                for (const mention of members) {
                    if (currentMessage.length + mention.length > maxChars) {
                        chunks.push(currentMessage);
                        currentMessage = baseMessage + mention;
                    } else {
                        currentMessage += mention;
                    }
                }
                if (currentMessage.length > baseMessage.length) chunks.push(currentMessage);

                for (let i = 0; i < amount; i++) {
                    for (const chunk of chunks) {
                        const message = await interaction.channel.send(chunk);
                        await message.delete();
                        totalMessagesSent++;
                    }
                }
            } else if (mode === "server") {
                const members = interaction.guild.members.cache.filter(m => !m.user.bot);
                const maxChars = 2000;
                const baseMessage = '*.* ||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||';
                let currentMessage = baseMessage;
                let chunks = [];
                totalUsersPinged = members.size;

                for (const member of members.values()) {
                    const mention = `<@${member.user.id}> `;
                    if (currentMessage.length + mention.length > maxChars) {
                        chunks.push(currentMessage);
                        currentMessage = baseMessage + mention;
                    } else {
                        currentMessage += mention;
                    }
                }
                if (currentMessage.length > baseMessage.length) chunks.push(currentMessage);

                for (const chunk of chunks) {
                    const message = await interaction.channel.send(chunk);
                    await message.delete();
                    totalMessagesSent++;
                }
            }

            interaction.followUp({
                content: `Ghostping terminé en mode **${mode}**.\n- Nombre de messages envoyés : **${totalMessagesSent}**\n- Nombre d'utilisateurs pingés : **${totalUsersPinged}**`,
                ephemeral: true,
            });
        } catch (error) {
            Logger.error(`Erreur dans la commande ghostping : ${error.message}`);
            interaction.followUp({
                content: "Une erreur est survenue pendant le traitement de la commande.",
                ephemeral: true,
            });
        }
    },
};
