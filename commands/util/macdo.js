const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const Logger = require('../../utils/Logger');

module.exports = {
    name: "macdo",
    category: "util",
    permissions: ['DEVELOPER'],
    usage: "macdo",
    examples: ["macdo"],
    description: "Permet de simuler une commande MacDo",
    async run(client, message, args) {

        // système de question comme un vrai macdo
        const questions = [
            "Quel menu souhaitez-vous ?",
            "Quelle boisson souhaitez-vous ?",
            "Quelle sauce souhaiteriez-vous ?",
            "Souhaitez-vous des frites ou des Potatoes ?",
            "Souhaitez-vous un dessert ?",
            "Souhaitez-vous un café ?",
            "Souhaitez-vous prendre la serveuse ?"
        ];

        let counter = 0;
        let answers = [];

        const filter = (m) => m.author.id === message.author.id;

        const ask = async (counter) => {
            if (counter === questions.length) {
                return message.channel.send(`Voici votre commande : \n${answers.join('\n')}`);
            }
            const question = questions[counter];
            await message.channel.send(question);
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000 });
            const answer = collected.first().content;
            answers.push(`${question} : ${answer}`);
            counter++;
            ask(counter);
        };

        ask(counter);


    },
};