const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
    repID: { type: String, required: true, unique: true }, // ID de la transaction
    sellerId: { type: String, required: true }, // ID de acheteur
    buyerId: { type: String, required: true }, // ID du vendeur
    itemName: { type: String, required: true }, // Nom de l'item vendu
    quantity: { type: Number, required: true }, // Quantité vendue
    price: { type: String, required: true }, // Prix de la transaction (en texte pour inclure les devises)
    paymentMethod: { type: String, required: true }, // Moyen de paiement
    date: { type: Date, default: Date.now }, // Date de la transaction
});

module.exports = mongoose.model("Sale", saleSchema);
