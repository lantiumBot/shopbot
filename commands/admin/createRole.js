const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const Logger = require('../../utils/Logger');
const getLogChannel = require('../../utils/getLogChannel')

module.exports = {
    name: "createrole",
    category: "admin",
    permissions: ['OWNERS', 'DEVELOPER'],
    usage: "/createRole [name] [color] [user] <emoji>",
    examples: ["/createRole \"MonRôle\" Rouge @Namtab :smile:", "/createRole \"MonRôle\" #ff5733 @Namtab :smile:"],
    description: "Crée un nouveau rôle décoratif, puis l'attribue directement à l'utilisateur spécifié.",
    options: [
        {
            name: "name",
            description: "Nom du rôle à créer.",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "user",
            description: "Utilisateur à qui attribuer le rôle.",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "color",
            description: "Couleur du rôle (choisissez une couleur prédéfinie ou entrez un code HEX).",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: "Blanc", value: "White" },
                { name: "Aqua", value: "Aqua" },
                { name: "Vert", value: "Green" },
                { name: "Bleu", value: "Blue" },
                { name: "Jaune", value: "Yellow" },
                { name: "Violet", value: "Purple" },
                { name: "Rose Bonbon", value: "LuminousVividPink" },
                { name: "Or", value: "Gold" },
                { name: "Orange", value: "Orange" },
                { name: "Rouge", value: "Red" },
                { name: "Gris", value: "Grey" },
                { name: "Myrtille", value: "Blurple" },
                { name: "Random", value: "Random" },
            ],
        },
        {
            name: "custom_hex",
            description: "Code HEX personnalisé (facultatif, ex: #ff5733).",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "emoji",
            description: "Emoji associé au rôle (optionnel).",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    async runInteraction(client, interaction) {
        const roleName = interaction.options.getString('name');
        const colorInput = interaction.options.getString('color');
        const customHex = interaction.options.getString('custom_hex') || null;
        const emojiInput = interaction.options.getString('emoji') || null;
        const user = interaction.options.getUser('user');
        const logChannel = await getLogChannel(interaction.guild, 'creationRole');


        const guild = interaction.guild;

        // Vérification de l'utilisateur
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            return interaction.reply({
                content: "L'utilisateur spécifié n'est pas dans ce serveur.",
                ephemeral: true,
            });
        }

        // Validation de la couleur
        let finalColor = colorInput;
        if (customHex) {
            const hexRegex = /^#?([0-9A-Fa-f]{6})$/;
            const match = customHex.match(hexRegex);
            if (!match) {
                return interaction.reply({
                    content: "Le code HEX fourni est invalide. Utilisez un format valide comme #ff5733 ou ff5733.",
                    ephemeral: true,
                });
            }
            finalColor = `#${match[1]}`; // Priorise le HEX
        }

        // Gestion de l'emoji
        let icon = null;
        if (emojiInput) {
            const customEmojiMatch = emojiInput.match(/^<:.*:(\d+)>$/); // Regex pour extraire l'ID des emojis personnalisés
            if (customEmojiMatch) {
                const emojiId = customEmojiMatch[1];
                const emoji = guild.emojis.cache.get(emojiId); // Récupération de l'emoji dans le cache du serveur
                if (emoji) {
                    icon = emoji.url; // URL de l'emoji personnalisé
                } else {
                    return interaction.reply({
                        content: "L'emoji personnalisé fourni doit appartenir à ce serveur. Vérifiez et réessayez.",
                        ephemeral: true,
                    });
                }
            } else {
                return interaction.reply({
                    content: "Veuillez fournir un emoji personnalisé valide. Les emojis standards ou animés ne sont pas acceptés.",
                    ephemeral: true,
                });
            }
        }

        // Création du rôle
        try {
            const role = await guild.roles.create({
                name: roleName,
                color: finalColor,
                icon: icon,
            });

            // Attribution du rôle au membre
            await member.roles.add(role);

            const targetRoleId = '1305334475781050369'; // ID du rôle cible

            // Récupération du rôle cible
            const targetRole = guild.roles.cache.get(targetRoleId);
            if (!targetRole) {
                console.log()
                return interaction.reply({
                    content: `Le rôle cible avec l'ID ${targetRoleId} n'a pas été trouvé.`,
                    ephemeral: true,
                });
            }

            // Déplacement du rôle nouvellement créé
            try {
                await role.setPosition(targetRole.position);
                Logger.client(`Rôle ${role.name} déplacé au-dessus du rôle cible (${targetRole.name}).`);
            } catch (error) {
                Logger.error(`Erreur lors du déplacement du rôle : ${error.message}`);
                return interaction.reply({
                    content: "Le rôle a été créé, mais une erreur est survenue lors du placement dans la liste.",
                    ephemeral: true,
                });
            }


            // Réponse et log
            const embed = new EmbedBuilder()
                .setTitle("Nouveau Rôle Créé")
                .setColor(finalColor)
                .addFields(
                    { name: "Nom du Rôle", value: roleName, inline: true },
                    { name: "Couleur", value: finalColor, inline: true },
                    { name: "Attribué à", value: `<@${user.id}>`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
            Logger.client(`Rôle créé : ${roleName} (ID : ${role.id}) avec couleur ${finalColor}`);

            // Log initial
            const logEmbed = new EmbedBuilder()
                .setTitle("Nouveau Rôle Créé via la commande CreateRole")
                .setColor("Green")
                .addFields(
                    { name: "Nom du rôle", value: roleName, inline: false },
                    { name: "Couleur Name ou HEX", value: finalColor, inline: false },
                    { name: "Emoji", value: emojiInput || "Aucun", inline: false },
                    { name: "Attribué à", value: `<@${user.id}> (${user.id})`, inline: false },
                    { name: "Créé par", value: `<@${interaction.user.id}> (${interaction.user.id})`, inline: false }
                )
                .setTimestamp();

            if (logChannel) {
                try {
                    await logChannel.send({ embeds: [logEmbed] });
                    Logger.client(`Logs envoyés dans le salon ${logChannel.name} (${logChannel.id}).`);
                } catch (error) {
                    Logger.error(`Impossible d'envoyer les logs dans ${logChannel.name} : ${error.message}`);
                }
            } else {
                Logger.warn("Aucun salon de log configuré pour les blacklist vocales.");
            }

        } catch (error) {
            Logger.error(`Erreur lors de la création du rôle : ${error.message}`);
            interaction.reply({
                content: "Une erreur est survenue lors de la création du rôle. Veuillez réessayer.",
                ephemeral: true,
            });
        }
    },
};
