const { promisify } = require('util');
const { glob } = require('glob');
const pGlob = promisify(glob);
const Logger = require("../Logger");


let eventList = [
    "guildCreate",
    "guildDelete",
    "guildMemberAdd",
    "guildMemberRemove",
    "guildMemberUpdate",
    "interaction",
    "interactionCreate",
    "message",
    "messageCreate",
    "messageDelete",
    "ready",
    "threadCreate",
    "threadDelete",
    "threadUpdate",
    "memberUpdate",
    'messageReactionAdd',
    'messageReactionRemove',
    'voiceStateUpdate',
    'channelUpdate',
    'channelDelete',
    'channelCreate',
    'guildUpdate'
];


module.exports = async (client) => {
    (await pGlob(`${process.cwd()}/events/*/*.js`)).map(async eventFile => {

        const event = require(eventFile);

        if (!event.name) return Logger.warn(
            `Evénement non-déclenché: ajouter un nom à votre événement ↓\nFichier => ${eventFile}`
        )

        if (!eventList.includes(event.name)) {
            return Logger.typo(
                `Evenemement non-déclenché: erreur de typo ↓\nFichier => ${eventFile}`
            )
        }

        if (event.once) {
            client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.name, (...args) => event.execute(client, ...args));
        }

        Logger.event(`- ${event.name}`);
    });
}
