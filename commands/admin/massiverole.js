const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Logger = require('../../utils/Logger');
const getLogChannel = require('../../utils/getLogChannel');

module.exports = {
    name: "massiverole",
    category: "admin",
    permissions: ['OWNERS'],
    usage: "massiverole <role>",
    examples: ["massiverole @role", "massiverole roleID", "massiverole roleName"],
    description: "Ajoute un rôle à tous les membres qui ne l'ont pas encore.",
    options: [
        {
            name: "role",
            description: "Le rôle à ajouter",
            type: ApplicationCommandOptionType.Role,
            required: true,
        },
    ],
    async run(client, message, args) {
        const roleInput = args.join(" ");
        const role = message.guild.roles.cache.find(r => r.id === roleInput || r.name.toLowerCase() === roleInput.toLowerCase()) || message.mentions.roles.first();

        if (!role) {
            return message.reply("Rôle invalide. Veuillez mentionner un rôle, fournir un ID ou un nom valide.");
        }

        const membersWithoutRole = message.guild.members.cache.filter(member =>
            !member.roles.cache.has(role.id) && !member.user.bot
        );

        const discussionChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase().includes("chat"));
        const discussionChannelId = discussionChannel ? discussionChannel.id : "#";


        const estimatedTime = (membersWithoutRole.size * 0.5).toFixed(1);

        const embed = new EmbedBuilder()
            .setTitle("Massiverole")
            .setDescription(`Préparation pour ajouter le rôle **${role.name}** à tous les membres humains sans ce rôle.`)
            .addFields(
                { name: "Rôle ajouté", value: `<@&${role.id}>`, inline: true },
                { name: "Cible", value: "Les humains", inline: true },
                { name: "Membres concernés", value: `${membersWithoutRole.size}`, inline: false },
                { name: "Temps estimé", value: `${estimatedTime}s`, inline: true }
            )
            .setColor('Blue')
            .setTimestamp();

        const confirmMessage = await message.reply({ embeds: [embed] });

        let count = 0;
        const progressMessage = await message.channel.send("Massiverole en cours...");

        for (const member of membersWithoutRole.values()) {
            try {
                await member.roles.add(role);
                await member.send(
                    `<@${member.id}> **Tu as été vérifié sur ${message.guild.name} n'hésite pas à parler dans <#${discussionChannelId}> !**`
                );
                count++;
            } catch (err) {
                Logger.error(`Erreur lors de l'ajout du rôle ou de l'envoi du message à ${member.user.tag}:`, err);
            }
        }

        const successMessage = `Le rôle <@&${role.id}> a été ajouté à ${count} membres.`;
        progressMessage.edit(successMessage);
    },
    async runInteraction(client, interaction) {
        const role = interaction.options.getRole('role');

        if (!role) {
            return interaction.reply({ content: "Rôle invalide.", ephemeral: true });
        }

        const membersWithoutRole = interaction.guild.members.cache.filter(member =>
            !member.roles.cache.has(role.id) && !member.user.bot
        );

        const discussionChannel = interaction.guild.channels.cache.find(channel => channel.name.toLowerCase().includes("discussion"));
        const discussionChannelId = discussionChannel ? discussionChannel.id : "#";

        const estimatedTime = (membersWithoutRole.size * 0.5).toFixed(1);

        const embed = new EmbedBuilder()
            .setTitle("Massiverole")
            .setDescription(`Préparation pour ajouter le rôle **${role.name}** à tous les membres humains sans ce rôle.`)
            .addFields(
                { name: "Rôle ajouté", value: `<@&${role.id}>`, inline: true },
                { name: "Cible", value: "Les humains", inline: true },
                { name: "Membres concernés", value: `${membersWithoutRole.size}`, inline: true },
                { name: "Temps estimé", value: `${estimatedTime}s`, inline: true }
            )
            .setColor('Blue')
            .setTimestamp();

        const startButton = new ButtonBuilder()
            .setCustomId('start_massiverole')
            .setLabel('🚀 Lancer le Massiverole')
            .setStyle(ButtonStyle.Primary);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel_massiverole')
            .setLabel('❌ Annuler le Massiverole')
            .setStyle(ButtonStyle.Danger);

        const actionRow = new ActionRowBuilder().addComponents(startButton, cancelButton);

        const message = await interaction.reply({ embeds: [embed], components: [actionRow], fetchReply: true });

        const collector = message.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async buttonInteraction => {
            if (buttonInteraction.user.id !== interaction.user.id) {
                return buttonInteraction.reply({ content: "Vous n'êtes pas autorisé à utiliser ce bouton.", ephemeral: true });
            }

            if (buttonInteraction.customId === 'start_massiverole') {
                await buttonInteraction.deferUpdate();

                let count = 0;
                const progressEmbed = EmbedBuilder.from(embed)
                    .setDescription(`Massiverole en cours...`)
                    .setColor('Orange');

                await interaction.editReply({ embeds: [progressEmbed], components: [] });

                for (const member of membersWithoutRole.values()) {
                    try {
                        await member.roles.add(role);
                        await member.send(
                            `<@${member.id}> **Tu as été vérifié sur ${interaction.guild.name} n'hésite pas à parler dans <#${discussionChannelId}> !**`
                        );
                        count++;
                    } catch (err) {
                        Logger.error(`Erreur lors de l'ajout du rôle ou de l'envoi du message à ${member.user.tag}:`, err);
                    }
                }


                const successEmbed = EmbedBuilder.from(embed)
                    .setDescription(`Le rôle <@&${role.id}> a été ajouté à ${count} membres.`)
                    .setColor('Green');

                await interaction.editReply({ embeds: [successEmbed], components: [] });
            }

            if (buttonInteraction.customId === 'cancel_massiverole') {
                await buttonInteraction.deferUpdate();

                const cancelEmbed = EmbedBuilder.from(embed)
                    .setDescription("Massiverole annulé.")
                    .setColor('Red');

                await interaction.editReply({ embeds: [cancelEmbed], components: [] });
                collector.stop();
            }
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                interaction.editReply({ content: "Le Massiverole a expiré.", components: [] });
            }
        });
    },
};
