const mongoose = require("mongoose");

const repSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // ID Discord du vendeur
    username: { type: String, required: true }, // Nom du vendeur
    rep: { type: Number, default: 0 }, // Nombre de reps
    totalSales: { type: Number, default: 0 }, // Total des ventes (en unités)
    lastUpdate: { type: Date, default: Date.now }, // Dernière mise à jour
});

module.exports = mongoose.model("Rep", repSchema);
