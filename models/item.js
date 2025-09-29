const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Nom affiché dans les choices
    value: { type: String, required: true }, // Valeur correspondante
});

module.exports = mongoose.model("Item", itemSchema);