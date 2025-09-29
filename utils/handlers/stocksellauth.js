// utils/handlers/stocksellauth.js

const axios = require("axios");
const { SELLAUTH_STOCKS } = require("../../ids");
const Logger = require("../Logger");

const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${process.env.SELLAUTH_URL}/v1/shops/${process.env.SELLAUTH_SHOPID}/products`,
    headers: {
        Authorization: `Bearer ${process.env.SELLAUTH_TOKEN}`,
    },
};

let previousStocks = {}; // Stockera le dernier état par produit

/**
 * Met à jour la liste de salons en fonction du stock global du produit
 * @param {Discord.Client} client
 */
async function checkAndUpdateStocks(client) {
    try {
        const response = await axios.request(config);
        const products = response.data.data;

        for (let product of products) {
            const productName = product.name;
            const stock = product.stock_count; // Stock global

            if (SELLAUTH_STOCKS[productName]) {
                if (previousStocks[productName] !== stock) {
                    previousStocks[productName] = stock;

                    const channelId = SELLAUTH_STOCKS[productName];
                    try {
                        const channel = await client.channels.fetch(channelId);
                        if (channel) {
                            const originalName = channel.name.split(":")[0].trim();
                            let newName;
                            if (
                                productName === "14x Server Boosts [ 1 month ]" &&
                                stock === 0
                            ) {
                                Logger.client(`[SellAuth] Stock épuisé pour "${productName}"`);
                                newName = `${originalName} : Out of Stock`;
                            } else if (
                                productName === "14x Server Boosts [ 1 month ]" &&
                                stock > 0
                            ) {
                                Logger.client(
                                    `[SellAuth] Stock disponible pour "${productName}": ${stock}`
                                );
                                newName = `${originalName} : ${stock} (x14)`;
                            } else {
                                newName = `${originalName} : ${stock}`;
                            }
                            await channel.setName(newName);
                            Logger.client(
                                `[SellAuth] Mise à jour du salon "${productName}": ${newName}`
                            );
                        }
                    } catch (e) {
                        Logger.client(
                            `[SellAuth] Erreur update salon "${productName}":`,
                            e.message
                        );
                    }
                }
            }
        }
    } catch (err) {
        Logger.client(
            "[SellAuth] Erreur lors de la récupération des stocks:",
            err.message
        );
    }
}

function startStockWatcher(client, interval = 30000) {
    Logger.client("[SellAuth] Surveillance des stocks démarrée");
    checkAndUpdateStocks(client);
    setInterval(() => checkAndUpdateStocks(client), interval);
}

module.exports = { startStockWatcher };
