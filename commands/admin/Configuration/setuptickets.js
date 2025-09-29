const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: "setuptickets",
    category: "admin",
    permissions: ['OWNERS'],
    usage: "setuptickets",
    examples: ["setuptickets"],
    description: "Set up ticket messages for support and order channels.",
    async run(client, message) {

        message.delete().catch(console.error);

        const embed = new EmbedBuilder()
            .setTitle('🛠️ Ticketing System')
            .setDescription('Use this menu to create a ticket and contact the sellers.\n\nUtilisez ce menu pour créer un ticket et contacter les vendeurs.')
            .setColor('Green');

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket_fr')
                .setLabel('🇫🇷 Ticket Français')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('open_ticket_en')
                .setLabel('🇬🇧 English Ticket')
                .setStyle(ButtonStyle.Success),
        );

        await message.channel.send({ embeds: [embed], components: [buttons] });
        await message.channel.send({ content: 'Ticket system configured!', ephemeral: true }).then(message => {
            setTimeout(() => {
                message.delete().catch(console.error);
            }, 5000);
        });
    },
};