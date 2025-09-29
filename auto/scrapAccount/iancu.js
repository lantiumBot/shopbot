const { chromium } = require('playwright'); // Importer Playwright
const cheerio = require('cheerio');
const Logger = require('../../utils/Logger');

/**
 * Fonction pour scraper les données depuis Iancu
 * @returns {Promise<Array>} - Retourne une liste d'objets contenant l'année et le stock
 */
async function scrapeIancu() {
    let browser = null;
    let page = null;

    try {
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const context = await browser.newContext(); // Créer un contexte de navigation
        page = await context.newPage(); // Ouvrir une nouvelle page

        const url = 'https://shop.iancu.services/product/discord-full-access-accounts';
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

        // Attendre quelques secondes pour charger complètement le contenu
        await page.waitForTimeout(5000);

        const html = await page.content();
        const $ = cheerio.load(html);

        // Liste des produits cibles
        const targetProducts = [
            "2015 Discord Account",
            "2016 Discord Account",
            "2017 Discord Account",
            "2018 Discord Account",
            "2019 Discord Account",
            "2020 Discord Account",
            "2021 Discord Account",
            "2022 Discord Account",
            "2023 Discord Account",
            "2024 Discord Full Access"
        ];

        const results = [];

        // Parcourir les boutons correspondant aux produits
        $('button[type="button"]').each((index, button) => {
            const productNameElement = $(button).find('p.text-base');
            const stockInfoElement = $(button).find('p.text-xs span');

            if (productNameElement.length && stockInfoElement.length) {
                const productName = productNameElement.text().trim();
                const stockInfo = stockInfoElement.text().trim();

                // Vérifier si le produit est dans la liste cible
                if (targetProducts.some(target => productName.includes(target))) {
                    results.push({
                        product: productName,
                        stock: stockInfo
                    });
                }
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
        Logger.error('[Iancu] Erreur critique :', error.message);
    } finally {
        if (browser) {
            await browser.close().catch(err => Logger.error('[Iancu] Erreur lors de la fermeture du navigateur :', err.message));
        }
        if (page) {
            await page.close().catch(err => Logger.error('[Iancu] Erreur lors de la fermeture de la page :', err.message));
        }
    }
}

module.exports = scrapeIancu;

// scrapeIancu()
//     .then(data => {
//         console.log(data);
//     })
//     .catch(error => {
//         console.error('Erreur lors du scraping :', error);
//     });