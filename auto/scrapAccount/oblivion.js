const { chromium } = require('playwright'); // Importer Playwright
const cheerio = require('cheerio');
const Logger = require('../../utils/Logger');

/**
 * Fonction pour scraper les données depuis OblivionShop
 * @returns {Promise<Array>} - Retourne une liste d'objets contenant l'année et le stock
 */
async function scrapeOblivionShop() {
    let browser = null;
    let page = null;

    try {
        // Lancer le navigateur Chromium avec Playwright
        browser = await chromium.launch({
            headless: true, // Mode sans interface graphique
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Arguments pour éviter les problèmes de permissions
        });

        const context = await browser.newContext(); // Créer un contexte de navigation
        page = await context.newPage(); // Ouvrir une nouvelle page

        const url = 'https://oblivionshop.cc/';
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }); // Attendre que le réseau soit inactif

        // Attendre quelques secondes pour charger complètement le contenu
        await page.waitForTimeout(5000);

        // Récupérer le contenu HTML de la page
        const html = await page.content();

        // Charger le HTML dans Cheerio pour l'analyse
        const $ = cheerio.load(html);

        // Liste des produits cibles
        const targetProducts = [
            "2015 Discord Full Access",
            "2016 Discord Full Access",
            "2017 Discord Full Access",
            "2018 Discord Full Access",
            "2019 Discord Full Access",
            "2020 Discord Full Access",
            "2021 Discord Full Access",
            "2022 Discord Full Access",
            "2023 Discord Full Access",
            "2024 Discord Full Access"
        ];

        const results = [];

        // Parcourir tous les produits
        $('div[x-show]').each((index, element) => {
            const productName = $(element).find('h3.text-lg.font-bold.mb-1.truncate').text().trim();
            const stockInfo = $(element).find('p.text-sm.text-t-primary\\/50.mb-2').text().trim();

            // Vérifier si le produit est dans la liste cible
            if (targetProducts.some(target => productName.includes(target))) {
                results.push({
                    product: productName,
                    stock: stockInfo
                });
            }
        });

        // Transformer les résultats pour ne garder que l'année et le stock en tant que nombres
        const transformedResults = results.map(result => {
            const yearMatch = result.product.match(/\d{4}/);
            const stockMatch = result.stock.match(/\d+/g);
            return {
                year: yearMatch ? parseInt(yearMatch[0], 10) : null,
                stock: stockMatch ? parseInt(stockMatch.join(''), 10) : 0
            };
        });

        return transformedResults;
    } catch (error) {
        Logger.error('[Oblivion] Erreur critique :', error.message);
    } finally {
        if (browser) {
            await browser.close().catch(err => Logger.error('[Oblivion] Erreur lors de la fermeture du navigateur :', err.message));
        }
        if (page) {
            await page.close().catch(err => Logger.error('[Oblivion] Erreur lors de la fermeture de la page :', err.message));
        }
    }
}

module.exports = scrapeOblivionShop;

// Exemple d'utilisation
// scrapeOblivionShop()
//     .then(data => {
//         console.log(data);
//     })
//     .catch(error => {
//         console.error('Erreur lors du scraping :', error);
//     });