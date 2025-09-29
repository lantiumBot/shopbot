const axios = require('axios');

(async () => {
    try {
        const response = await axios.get('https://oblivionshop.cc/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            },
        });

        if (response.status === 503) {
            console.error('Le serveur est temporairement indisponible. Réessayez plus tard.');
            return;
        }

        console.log(response.data);
    } catch (error) {
        if (error.response && error.response.status === 503) {
            console.error('Erreur 503 : Le serveur est temporairement indisponible.');
        } else {
            console.error('Erreur inattendue :', error.message);
        }
    }
})();