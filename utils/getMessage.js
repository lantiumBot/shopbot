const messages = require('./messages');

/**
 * Récupère le message selon la locale ('fr', 'en', etc).
 * @param {string} key La clé du message (ex : 'vendorNotFound')
 * @param {string} locale La locale Discord.js (ex : 'fr', 'en-US')
 * @param {...any} params Arguments optionnels pour les messages dynamiques
 */
function getMessage(key, locale, ...params) {
    if (!messages[key]) return messages.unknownError['en'];

    const lang = locale && locale.startsWith('fr') ? 'fr' : 'en';
    const message = messages[key][lang] || messages[key]['en'];

    // Si c'est une fonction, appelle-la avec params
    if (typeof message === "function") {
        return message(...params);
    }
    return message;
}

module.exports = getMessage;
