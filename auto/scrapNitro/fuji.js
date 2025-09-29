// scrapers/fujiScraper.js
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cheerio = require("cheerio");
const Logger = require("../../utils/Logger"); // Assurez-vous que le chemin est correct

// Utilisation du plugin Stealth pour éviter les détections anti-bot
puppeteer.use(StealthPlugin());

/**
 * Fonction pour scraper les données de Fuji.mysellauth.com
 * @returns {Promise<Array>} - Retourne une liste d'objets contenant les produits ciblés
 */
async function scrapeFuji() {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    const url = "https://fuji.mysellauth.com/";
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Attendre quelques secondes pour charger complètement le contenu
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    // Liste des produits cibles
    const targetProducts = ["nitro boost"];

    const results = [];
    $(".text-left.px-5.pb-4").each((index, element) => {
      const productName = $(element)
        .find("h3.text-lg.font-bold.mb-1.truncate")
        .text()
        .trim();
      let availability = $(element)
        .find("p.text-sm.text-t-primary\\/50.mb-2")
        .text()
        .trim();
      const price = $(element)
        .find(
          "p.text-base.font-semibold.text-t-primary\\/50.truncate span.text-accent-500"
        )
        .text()
        .trim();

      // Normalisation de la disponibilité
      if (availability.toLowerCase() === "out of stock") {
        availability = "Out of Stock";
      } else if (!isNaN(parseInt(availability))) {
        availability = `${parseInt(availability)} in stock`;
      } else {
        availability = "Unknown";
      }

      // Vérifier si le produit est dans la liste cible
      if (targetProducts.includes(productName)) {
        results.push({
          name: productName,
          availability: availability,
          price: price,
        });
      }
    });

    return results;
  } catch (error) {
    console.error("Une erreur est survenue lors du scraping :", error.message);
    throw error; // Propager l'erreur pour que l'appelant puisse la gérer
  }
}

module.exports = scrapeFuji;