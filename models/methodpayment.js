const mongoose = require("mongoose");

const methodpaymentSchema = new mongoose.Schema({
    id: String,
    name: String,
    information: String,
    active: { type: Boolean, default: true },
});

module.exports = mongoose.model("MethodPayment", methodpaymentSchema);
