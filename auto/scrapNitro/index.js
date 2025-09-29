const scrapeAmeryShoper = require('./ameryshoper'); // Importer le scraper d'AmeryShoper
const scrapeFuji = require('./fuji'); // Importer le scraper de Fuji

/**
 * Fonction principale pour exécuter les scrapers et retourner les résultats regroupés
 * @returns {Promise<Array>} - Résultats finaux regroupés par année
 */
async function scrapeAccount() {
    try {
        // Appeler les deux scrapers en parallèle
        const [ameryShoperResults, fujiResults] = await Promise.all([
            scrapeAmeryShoper(),
            scrapeFuji()
        ]);

        // Concaténer les résultats des deux scrapers
        const allResults = [...ameryShoperResults, ...fujiResults];

        return allResults;
    } catch (error) {
        console.error('Une erreur est survenue lors du traitement :', error.message);
        throw error; // Propager l'erreur pour que le bot puisse la gérer
    }
}

// Exporter la fonction scrapeAccount pour qu'elle soit utilisable dans d'autres fichiers
module.exports = scrapeNitro;

// scrapeAccount()
//     .then((results) => {
//         console.log('Résultats du scraping :', results);
//     })
//     .catch((error) => {
//         console.error('Erreur lors du scraping :', error);
//     });