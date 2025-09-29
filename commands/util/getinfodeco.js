const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const Logger = require('../../utils/Logger');
const getLogChannel = require('../../utils/getLogChannel');

const COUNTRY_CODE = 'FR';
const PAYMENT_SOURCE_ID = '1405655708569047061';
const VARIANTS_RETURN_STYLE = '2';

function formatEuro(amount, exponent = 2) {
    if (typeof amount !== 'number' || exponent < 0) return 'N/A';
    const s = String(Math.abs(amount)).padStart(exponent + 1, '0');
    const intPart = s.slice(0, -exponent);
    const fracPart = s.slice(-exponent);
    return `${amount < 0 ? '-' : ''}${intPart},${fracPart} €`;
}

// Extraction SKU depuis URL ou ID brut
function extractSku(input) {
    const match = input.match(/(\d{15,30})$/); // on chope juste le dernier gros nombre
    return match ? match[1] : null;
}

async function fetchSku(skuId) {
    const url = `https://discord.com/api/v9/store/published-listings/skus/${skuId}?country_code=${COUNTRY_CODE}&payment_source_id=${PAYMENT_SOURCE_ID}&variants_return_style=${VARIANTS_RETURN_STYLE}`;
    const { data } = await axios.get(url, { timeout: 15000, validateStatus: s => s >= 200 && s < 500 });

    if (!data || !data.sku) throw new Error(`SKU ${skuId} introuvable ou invalide.`);

    const name = data.sku.name ?? 'Unknown';
    const amount = data.sku.price?.amount;
    const exponent = data.sku.price?.currency_exponent ?? 2;
    const priceStr = amount ? formatEuro(amount, exponent) : 'N/A';

    const premium = data.sku.price?.premium?.['2'];
    const premiumStr = premium?.amount ? formatEuro(premium.amount, exponent) : null;

    return { skuId, name, priceStr, premiumStr };
}

module.exports = {
    name: 'getinfodeco',
    category: 'shop',
    permissions: ['SendMessages'],
    usage: '/getinfodeco skus:<sku_id | url ...>',
    examples: ['/getinfodeco skus:1409898407799160963', '/getinfodeco skus:"https://discord.com/shop#itemSkuId=1409898407799160963"'],
    description: 'Affiche le nom et le prix € des décorations Discord à partir de SKU ou d’URL.',
    options: [
        {
            name: 'skus',
            description: 'Un ou plusieurs SKU_ID ou URLs séparés par des espaces',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    async runInteraction(client, interaction) {
        const guild = interaction.guild;
        const logChannel = await getLogChannel(guild, 'decoVoc').catch(() => null);

        const raw = interaction.options.getString('skus');
        // On split, on extrait les IDs même depuis les URLs
        const ids = Array.from(
            new Set(
                raw
                    .split(/\s+/)
                    .map(x => extractSku(x.trim()))
                    .filter(Boolean)
            )
        );

        if (!ids.length) {
            return interaction.reply({ content: 'Donne-moi au moins un SKU_ID ou une URL valide.', ephemeral: true });
        }

        await interaction.deferReply();

        const results = await Promise.allSettled(ids.map(id => fetchSku(id)));
        const ok = results.filter(r => r.status === 'fulfilled').map(r => r.value);
        const ko = results.filter(r => r.status === 'rejected').map((r, i) => ({ skuId: ids[i], error: r.reason?.message }));

        const embed = new EmbedBuilder()
            .setTitle('Infos Décorations')
            .setColor(0x5865f2)
            .setTimestamp()
            .setFooter({ text: `Country=${COUNTRY_CODE}` });

        if (ok.length) {
            ok.forEach(item => {
                const lines = [
                    `**Prix:** ${item.priceStr}`,
                    item.premiumStr ? `**Prix Nitro:** ${item.premiumStr}` : null,
                    `**SKU:** \`${item.skuId}\``,
                ].filter(Boolean);

                embed.addFields({ name: item.name, value: lines.join('\n') });
            });
        }

        if (ko.length) {
            embed.addFields({
                name: 'Erreurs',
                value: ko.map(e => `• \`${e.skuId}\` → ${e.error}`).join('\n'),
            });
        }

        await interaction.editReply({ embeds: [embed] });

        if (logChannel) {
            logChannel.send({ content: `Commande /decoinfo exécutée par <@${interaction.user.id}>` }).catch(() => { });
        }
    },
};
