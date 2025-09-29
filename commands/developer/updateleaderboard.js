const updateLeaderboard = require("../../utils/handlers/updateLeaderboard");

module.exports = {
    name: "updateleaderboard",
    category: "developer",
    permissions: ['DEVELOPER'],
    usage: "updateleaderboard",
    examples: ["updateleaderboard"],
    description: "Met à jour le leaderboard",
    async runInteraction(client, interaction) {

        // Mise à jour du leaderboard
        await updateLeaderboard(client);

        // Réponse à l'utilisateur
        await interaction.reply({
            content: "Le leaderboard a été mis à jour avec succès.",
            ephemeral: true,
        });

    },
};