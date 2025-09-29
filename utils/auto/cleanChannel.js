const { Client, Intents } = require('discord.js');
const cron = require('node-cron');

require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Schedule task to run at 4 AM every day
    cron.schedule('0 4 * * *', async () => {
        const channelId = 'YOUR_CHANNEL_ID'; // Replace with your channel ID
        const channel = await client.channels.fetch(channelId);

        if (channel.isText()) {
            let fetched;
            do {
                fetched = await channel.messages.fetch({ limit: 100 });
                await channel.bulkDelete(fetched);
            } while (fetched.size >= 2);
        }
    });
});

client.login(process.env.DISCORD_TOKEN);