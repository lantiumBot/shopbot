// models/TicketSettings.js
const mongoose = require("mongoose");

const ticketsSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive",
    },
    categoryId: {
        type: String,
        default: null,
    },
    allowedRoles: {
        type: [String],
        default: [],
    },
    logsTickets: {
        type: String,
        default: null,
    },
    texteEmbedTickets: {
        type: String,
        default: ":Igna_bubbletea: Décris nous ton problème nous sommes à ton écoute :Igna_mochi:",
    },
    textePingTickets: {
        type: String,
        default: "Bienvenue {user} sur votre ticket ! <@&{role}>",
    },
});

module.exports = mongoose.model("TicketSettings", ticketsSchema);