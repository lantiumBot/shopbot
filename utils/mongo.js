const mongoose = require('mongoose');
const Logger = require('./Logger'); // Ajuste le chemin si besoin

mongoose.set('strictQuery', true); // Option pour des requêtes strictes

// Initialiser la connexion MongoDB
async function connectToDatabase() {
    if (mongoose.connection.readyState === 0) { // 0 = disconnected
        try {
            await mongoose.connect(process.env.DATABASE_URI, {
                autoIndex: false,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                family: 4, // IPv4
            });
            Logger.client("✅ Base MongoDB connectée avec succès !");
        } catch (err) {
            Logger.error(`❌ Erreur MongoDB : ${err.message}`);
            throw err;
        }
    }
}

module.exports = {
    mongoose,
    connectToDatabase,
};