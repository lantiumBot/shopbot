const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    ticketId: { type: String, required: true },
    userId: { type: String, required: true },
    items: [
        {
            name: { type: String, required: true },
            quantity: { type: Number },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Ticket", ticketSchema);
