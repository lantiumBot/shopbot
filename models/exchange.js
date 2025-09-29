const mongoose = require("mongoose");

const exchangeSchema = new mongoose.Schema({
    repID: { type: String, required: true, unique: true }, // ID de la transaction
    sellerId: { type: String, required: true }, // ID de acheteur
    buyerId: { type: String, required: true }, // ID du vendeur
    paymentFrom: { type: String, required: true }, // Nom de l'item vendu
    montantFrom: { type: Number, required: true }, // Quantité vendue
    paymentTo: { type: String, required: true }, // Prix de la transaction (en texte pour inclure les devises)
    montantTo: { type: Number, required: true }, // Moyen de paiement
    date: { type: Date, default: Date.now }, // Date de la transaction
});

module.exports = mongoose.model("Exchange", exchangeSchema);