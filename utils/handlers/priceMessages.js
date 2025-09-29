// utils/handlers/priceMessages.js
// Builds localized embeds (FR/EN) from messages.js for your 9 items

const { EmbedBuilder } = require("discord.js");
const MSGS = require("../../utils/messages"); // adapte le chemin si besoin

const COLOR = 0x5865F2;
const THUMB = null; // optionnel

const pick = (obj, lang) => (obj?.[lang] ?? obj?.fr ?? "");
const pickArr = (obj, lang) => (obj?.[lang] ?? obj?.fr ?? []);

function priceEmbed({ title, blurb, fields = [], note }) {
    const e = new EmbedBuilder().setColor(COLOR);
    if (title) e.setTitle(title);
    if (blurb) e.setDescription(blurb);
    if (fields.length) e.addFields(fields);
    if (note) e.setFooter({ text: note });
    if (THUMB) e.setThumbnail(THUMB);
    return e;
}

// Items meta + builders
const ITEMS = [
    {
        id: "nitro_boost",
        label: "N1tr0 B00st",
        emoji: { id: "1420789058644213880" },
        style: "Primary",
        build: (lang) => [
            priceEmbed({
                title: pick(MSGS.shop.nitroBoost.title, lang),
                blurb: pick(MSGS.shop.nitroBoost.blurb, lang),
                fields: pickArr(MSGS.shop.nitroBoost.fields, lang),
                note: pick(MSGS.shop.nitroBoost.note, lang),
            }),
        ],
    },

    {
        id: "decoration",
        label: "D3c0r4t10n",
        emoji: "🖼️",
        style: "Primary",
        build: (lang) => [
            priceEmbed({
                title: pick(MSGS.shop.decoration.gift.title, lang),
                blurb: pick(MSGS.shop.decoration.gift.blurb, lang),
                fields: [{ name: pick({ fr: "Tarifs", en: "Rates" }, lang), value: pick(MSGS.shop.decoration.gift.ratesBlock, lang), inline: false }],
                note: pick(MSGS.shop.decoration.gift.note, lang),
            }),
            priceEmbed({
                title: pick(MSGS.shop.decoration.login.title, lang),
                blurb: pick(MSGS.shop.decoration.login.blurb, lang),
                fields: [{ name: pick({ fr: "Tarifs", en: "Rates" }, lang), value: pick(MSGS.shop.decoration.login.ratesBlock, lang), inline: false }],
                note: pick(MSGS.shop.decoration.login.note, lang),
            }),
        ],
    },

    {
        id: "server_boost",
        label: "S3rv3r B00st",
        emoji: { id: "1420789062272421909" },
        style: "Primary",
        build: (lang) => [
            priceEmbed({
                title: pick(MSGS.shop.serverBoost.title, lang),
                blurb: pick(MSGS.shop.serverBoost.blurb, lang),
                fields: pickArr(MSGS.shop.serverBoost.fields, lang),
                note: pick(MSGS.shop.serverBoost.note, lang),
            }),
        ],
    },

    {
        id: "nitro_token",
        label: "T0k3n B00st",
        emoji: { id: "1420789062272421909" },
        style: "Primary",
        build: (lang) => [
            priceEmbed({
                title: pick(MSGS.shop.nitroToken.title, lang),
                blurb: pick(MSGS.shop.nitroToken.blurb, lang),
                note: pick(MSGS.shop.nitroToken.note, lang),
            }),
        ],
    },

    {
        id: "exchange",
        label: "3xch4ng3",
        emoji: "💰",
        style: "Primary",
        build: (lang) => [
            priceEmbed({
                title: pick(MSGS.shop.exchange.title, lang),
                blurb: pick(MSGS.shop.exchange.blurb, lang),
                fields: [
                    { name: pick(MSGS.shop.exchange.ppToCrypto, lang), value: pick(MSGS.shop.exchange.ppToCryptoBlock, lang), inline: false },
                    { name: pick(MSGS.shop.exchange.c2c, lang), value: pick(MSGS.shop.exchange.c2cBlock, lang), inline: false },
                    { name: pick(MSGS.shop.exchange.other, lang), value: pick(MSGS.shop.exchange.otherBlock, lang), inline: false },
                ],
                note: pick(MSGS.shop.exchange.note, lang),
            }),
        ],
    },

    {
        id: "tag_username",
        label: "T4g Us3rn4m3",
        emoji: { id: "1420807445285961802" },
        style: "Primary",
        build: (lang) => [
            priceEmbed({
                title: pick(MSGS.shop.tagUsername.title, lang),
                blurb: pick(MSGS.shop.tagUsername.blurb, lang),
                note: pick(MSGS.shop.tagUsername.note, lang),
            }),
        ],
    },

    {
        id: "temp_sms",
        label: "T3mp SMS",
        emoji: { id: "1420807445285961802" },
        style: "Primary",
        build: (lang) => [
            priceEmbed({
                title: pick(MSGS.shop.tempSms.title, lang),
                blurb: pick(MSGS.shop.tempSms.blurb, lang),
                note: pick(MSGS.shop.tempSms.note, lang),
            }),
        ],
    },

    {
        id: "top-up",
        label: "Top-Up",
        emoji: { id: "1420807445285961802" },
        style: "Primary",
        build: (lang) => [
            priceEmbed({
                title: pick(MSGS.shop.topup.title, lang),
                blurb: pick(MSGS.shop.topup.blurb, lang),
                note: pick(MSGS.shop.topup.note, lang),
            }),
        ],
    },

    // Un seul bouton "account" → 2 embeds (années + types)
    {
        id: "account",
        label: "4cc0unt",
        emoji: { id: "1420807445285961802" },
        style: "Primary",
        build: (lang) => [
            priceEmbed({
                title: pick(MSGS.shop.account.title, lang),
                blurb: pick(MSGS.shop.account.yearsBlock, lang),
                note: pick(MSGS.shop.account.note, lang),
            })
        ],
    },
    {
        id: "fivem_account",
        label: "5M 4cc0unt",
        emoji: { id: "1420789333778235463" },
        style: "Primary",
        build: (lang) => [
            priceEmbed({
                title: pick(MSGS.shop.accountfivem.title, lang),
                kindsBlock: pick(MSGS.shop.accountfivem.kindsBlock, lang),
            }),
        ],
    }
];

function getReplyByCustomId(customId, lang = "fr") {
    const safeLang = String(lang).toLowerCase().startsWith("en") ? "en" : "fr";
    const it = ITEMS.find((x) => x.id === customId);
    if (!it) {
        return { embeds: [new EmbedBuilder().setColor(0xed4245).setDescription(pick({ fr: "Item introuvable.", en: "Item not found." }, safeLang))] };
    }
    return { embeds: it.build(safeLang) };
}

function getButtonsMeta() {
    return ITEMS.map((i) => ({ id: i.id, label: i.label, emoji: i.emoji, style: i.style }));
}

module.exports = { getButtonsMeta, getReplyByCustomId };
