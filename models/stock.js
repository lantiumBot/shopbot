const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    sellerId: { type: String, required: true }, // ID du vendeur
    items: [
        {
            name: { type: String, required: true }, // Nom de l'item
            quantity: { type: Number, required: true }, // Quantité en stock
        },
    ],
});

module.exports = mongoose.model('Stock', stockSchema);
