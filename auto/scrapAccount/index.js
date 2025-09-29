const scrapeOblivionShop = require('./oblivion'); // Importer le scraper pour OblivionShop
const scrapeIancu = require('./iancu'); // Importer le scraper pour Iancu

/**
 * Fonction pour regrouper les stocks par année
 * @param {Array} results - Tableau des résultats des scrapers
 * @returns {Array} - Tableau regroupé avec les stocks cumulés par année
 */
function groupStocksByYear(results) {
    const groupedResults = {};

    // Parcourir tous les résultats
    results.forEach(({ year, stock }) => {
        if (!groupedResults[year]) {
            groupedResults[year] = { year, stock: 0 }; // Initialiser l'année si elle n'existe pas encore
        }
        groupedResults[year].stock += stock; // Ajouter le stock à l'année correspondante
    });

    // Convertir l'objet en tableau
    return Object.values(groupedResults).sort((a, b) => a.year - b.year); // Trier par année croissante
}

/**
 * Fonction principale pour exécuter les scrapers et retourner les résultats regroupés
 * @returns {Promise<Array>} - Résultats finaux regroupés par année
 */
async function scrapeAccount() {
    try {
        // Appeler les deux scrapers en parallèle
        const [oblivionResults, iancuResults] = await Promise.all([
            scrapeOblivionShop(),
            scrapeIancu()
        ]);

        // Concaténer les résultats des deux scrapers
        const allResults = [...oblivionResults, ...iancuResults];

        // Regrouper les stocks par année
        const groupedResults = groupStocksByYear(allResults);

        return groupedResults;
    } catch (error) {
        console.error('Une erreur est survenue lors du traitement :', error.message);
        throw error; // Propager l'erreur pour que le bot puisse la gérer
    }
}

// Exporter la fonction scrapeAccount pour qu'elle soit utilisable dans d'autres fichiers
module.exports = scrapeAccount;