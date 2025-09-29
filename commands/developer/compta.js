const { ApplicationCommandOptionType } = require("discord.js");
const { google } = require("googleapis");
const path = require("path");

// Google Sheets
const spreadsheetId = "1-uNCN_LE4-oB87pN9bqi9KGBh6V-vHzYdWJC7tvYwhE";
const keyFilePath = path.join(__dirname, "./credentials.json");
const scopes = ["https://www.googleapis.com/auth/spreadsheets"];

const auth = new google.auth.GoogleAuth({ keyFile: keyFilePath, scopes });
let googleSheets = null;
let sheetsValues = null;

async function initGoogleSheets() {
    if (googleSheets && sheetsValues) return;
    const authClient = await auth.getClient();
    googleSheets = google.sheets({ version: "v4", auth: authClient });
    sheetsValues = googleSheets.spreadsheets.values;
}

/* ------------------ Utils core ------------------ */
const LABELS = {
    date: ["date du vouch", "vouch date", "date"],
    buyer: ["vouch par", "vouch by", "buyer", "acheteur"],
    vouchId: ["vouch n°", "vouch #", "vouch id", "id"],
    vendor: ["vendeur", "vendor", "seller"],
    itemSold: ["item vendu", "item sold", "product", "article"],
    exchange: ["exchange", "échange", "swap"],
};

// retire accents + ponctuation légère + trim + lowercase
function norm(s) {
    return (s || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[:*|]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

// mappe fields en {normName: value}
function fieldsToMap(embed) {
    const map = {};
    for (const f of embed.fields || []) {
        const k = norm(f.name);
        map[k] = f.value;
    }
    return map;
}

function findFirst(map, aliases) {
    for (const a of aliases) {
        const v = map[norm(a)];
        if (v != null && v !== "") return v;
    }
    return null;
}

// parse description en mode "Label: valeur" multilignes FR/EN
function descriptionToMap(desc) {
    const out = {};
    if (!desc) return out;
    const lines = desc
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
    for (const line of lines) {
        const m = line.match(/^\s*([\w\sÀ-ÿ#°]+?)\s*[:：]\s*(.+)$/i);
        if (!m) continue;
        const key = norm(m[1]);
        const val = m[2].trim();
        if (key) out[key] = val;
    }
    return out;
}

// essaie de choper une date JJ/MM/AAAA (sinon ts embed → ts message)
function coerceDate(v, embedTs, messageTs) {
    const tryStr = String(v || "");
    const m = tryStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (m) {
        const [, d, mo, y] = m;
        const yyyy = y.length === 2 ? `20${y}` : y.padStart(4, "0");
        return `${d.padStart(2, "0")}/${mo.padStart(2, "0")}/${yyyy}`;
    }
    if (embedTs)
        try {
            return new Date(embedTs).toLocaleDateString("fr-FR");
        } catch { }
    if (messageTs)
        try {
            return new Date(messageTs).toLocaleDateString("fr-FR");
        } catch { }
    return "";
}

// Cherche une Vente/Exchange dans une chaîne brute (fields + description concat)
function scanSaleOrExchange(text) {
    if (!text) return null;
    const t = text.replace(/\s+/g, " ").trim();

    // Vente (qty x/× item (prix devise) via|paid via méthode) — () optionnelles
    const saleRx =
        /(\d+)\s*[x×]\s*(.+?)\s*(?:\(\s*)?([\d\s.,]+)\s*(€|eur|\$|usd|£|gbp)(?:\s*\))?(?:\s*(?:via|par|paid\s*via)\s+(.+?))(?=$|[.!)]| Image)/i;

    // Exchange (montant devise de/from A vers/to montant devise en/in B)
    const exRx =
        /([\d\s.,]+)\s*(€|eur|\$|usd|£|gbp)?\s*(?:de|from)\s*(.+?)\s*(?:vers|to)\s*([\d\s.,]+)\s*(€|eur|\$|usd|£|gbp)?\s*(?:en|in)\s*(.+?)($|[.!)]| Image)/i;

    let m = t.match(saleRx);
    if (m) {
        const qty = m[1].trim();
        const item = m[2].trim();
        const total = parseFloat(m[3].replace(/\s/g, "").replace(",", "."));
        const method = (m[5] || "").trim();
        return {
            kind: "sale",
            qty,
            item,
            total: Number.isFinite(total) ? total.toFixed(2) : "",
            method,
        };
    }

    m = t.match(exRx);
    if (m) {
        const fromAmt = parseFloat(m[1].replace(/\s/g, "").replace(",", "."));
        const toAmt = parseFloat(m[4].replace(/\s/g, "").replace(",", "."));
        return {
            kind: "exchange",
            fromAmt: Number.isFinite(fromAmt) ? fromAmt.toFixed(2) : "",
            fromMethod: m[3].trim(),
            toAmt: Number.isFinite(toAmt) ? toAmt.toFixed(2) : "",
            toMethod: m[6].trim(),
        };
    }
    return null;
}

function extractIdFromMention(s) {
    const m = String(s || "").match(/<@!?(\d+)>/);
    return m ? m[1] : "";
}

async function resolveUserTag(client, userId) {
    if (!userId) return "";
    try {
        const user =
            client.users.cache.get(userId) ||
            (await client.users.fetch(userId).catch(() => null));
        return user ? user.tag : userId;
    } catch {
        return userId;
    }
}

/* ------------------ Google safe calls ------------------ */
async function safeGoogleCall(fn, ...args) {
    let retries = 6,
        delay = 1000;
    while (retries > 0) {
        try {
            return await fn(...args);
        } catch (err) {
            const status = err?.response?.status || err?.code || err?.status;
            if (String(status) === "429") {
                await new Promise((r) => setTimeout(r, delay));
                delay *= 2;
                retries--;
                continue;
            }
            throw err;
        }
    }
    throw new Error("safeGoogleCall: retries épuisés");
}

async function readSheetAll(range) {
    await initGoogleSheets();
    const res = await safeGoogleCall(sheetsValues.get.bind(sheetsValues), {
        spreadsheetId,
        range,
    });
    return res.data.values || [];
}

async function appendRowsBatch(sheetName, startRangeA1, rows) {
    if (!rows?.length) return { updatedRows: 0 };
    await initGoogleSheets();
    const res = await safeGoogleCall(sheetsValues.append.bind(sheetsValues), {
        spreadsheetId,
        range: `${sheetName}!${startRangeA1}`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: { values: rows },
    });
    const updates = res.data.updates || {};
    return { updatedRows: updates.updatedRows || rows.length };
}

/* ------------------ Embed collection (inclut forwards/replies) ------------------ */
async function collectEmbedsDeep(message) {
    const embeds = [...(message.embeds || [])];

    if (message.reference?.messageId) {
        try {
            const ref = await message.fetchReference();
            for (const e of ref.embeds || []) embeds.push(e);
        } catch { }
    }

    // dédoublonnage naïf
    const seen = new Set();
    const unique = [];
    for (const e of embeds) {
        const h = `${e.title || ""}|${e.description || ""}|${JSON.stringify(
            e.fields || []
        )}`;
        if (seen.has(h)) continue;
        seen.add(h);
        unique.push(e);
    }
    return unique;
}

/* ------------------ Extraction transaction bilingue ------------------ */
async function extractTransactionData(embed, client, messageCtx = null) {
    const fmap = fieldsToMap(embed);
    const dmap = descriptionToMap(embed.description);

    // Date (champ -> ts embed -> ts message)
    const dateRaw =
        findFirst(fmap, LABELS.date) || findFirst(dmap, LABELS.date) || "";
    const date = coerceDate(
        dateRaw,
        embed.timestamp,
        messageCtx?.createdTimestamp
    );

    // Buyer
    const buyerRaw =
        findFirst(fmap, LABELS.buyer) || findFirst(dmap, LABELS.buyer) || "";
    const buyerId = extractIdFromMention(buyerRaw);
    let buyerTag = await resolveUserTag(client, buyerId);
    if (!buyerTag && buyerRaw) buyerTag = buyerRaw.replace(/^@/, "");

    // VouchId
    const vouchId = (
        findFirst(fmap, LABELS.vouchId) ||
        findFirst(dmap, LABELS.vouchId) ||
        ""
    )
        .toString()
        .trim();

    // Vendor
    const vendorRaw =
        findFirst(fmap, LABELS.vendor) || findFirst(dmap, LABELS.vendor) || "";
    const vendorId = extractIdFromMention(vendorRaw);
    let vendorTag = await resolveUserTag(client, vendorId);
    const vendor = (vendorTag || vendorRaw || "").replace(/^@/, "");

    const baseData = { date, buyerId, buyerTag, vouchId, vendor, type: "" };

    // 1) Via labels
    const itemField = (
        findFirst(fmap, LABELS.itemSold) ||
        findFirst(dmap, LABELS.itemSold) ||
        ""
    ).trim();
    if (itemField) {
        const rxSale =
            /(\d+)\s*[x×]\s*(.*?)\s*(?:\(\s*)?([\d\s.,]+)\s*(?:€|eur|\$|usd|£|gbp)(?:\s*\))?(?:\s*(?:via|par|paid\s*via)\s+(.+))?$/i;
        const m = itemField.match(rxSale);
        if (m) {
            const qty = m[1].trim();
            const item = m[2].trim();
            const total = parseFloat(m[3].replace(/\s/g, "").replace(",", "."));
            const method = (m[4] || "").trim();
            return {
                ...baseData,
                type: "Vente",
                item,
                quantity: qty,
                totalPrice: Number.isFinite(total) ? total.toFixed(2) : "",
                paymentMethod: method,
            };
        }
    }

    const exchField = (
        findFirst(fmap, LABELS.exchange) ||
        findFirst(dmap, LABELS.exchange) ||
        ""
    ).trim();
    if (exchField) {
        const rxEx =
            /([\d\s.,]+)\s*(?:€|eur|\$|usd|£|gbp)?\s*(?:de|from)\s*(.+?)\s*(?:vers|to)\s*([\d\s.,]+)\s*(?:€|eur|\$|usd|£|gbp)?\s*(?:en|in)\s*(.+)$/i;
        const m = exchField.match(rxEx);
        if (m) {
            const fromAmt = parseFloat(m[1].replace(/\s/g, "").replace(",", "."));
            const toAmt = parseFloat(m[3].replace(/\s/g, "").replace(",", "."));
            return {
                ...baseData,
                type: "Exchange",
                fromAmount: Number.isFinite(fromAmt) ? fromAmt.toFixed(2) : "",
                fromMethod: m[2].trim(),
                toAmount: Number.isFinite(toAmt) ? toAmt.toFixed(2) : "",
                toMethod: m[4].trim(),
                fees: Number.isFinite(fromAmt) ? (fromAmt * 0.05).toFixed(2) : "",
            };
        }
    }

    // 2) Fallback brut sur tout le texte
    const rawText = [
        embed.title || "",
        embed.description || "",
        ...(embed.fields || []).map((f) => `${f.name}: ${f.value}`),
    ].join("\n");
    const hit = scanSaleOrExchange(rawText);
    if (hit) {
        if (hit.kind === "sale") {
            return {
                ...baseData,
                type: "Vente",
                item: hit.item,
                quantity: hit.qty,
                totalPrice: hit.total,
                paymentMethod: hit.method,
            };
        }
        if (hit.kind === "exchange") {
            return {
                ...baseData,
                type: "Exchange",
                fromAmount: hit.fromAmt,
                fromMethod: hit.fromMethod,
                toAmount: hit.toAmt,
                toMethod: hit.toMethod,
                fees: hit.fromAmt ? (Number(hit.fromAmt) * 0.05).toFixed(2) : "",
            };
        }
    }

    return null;
}

/* ------------------ Chunked replies (<=2000 chars) ------------------ */
function chunkText(str, max = 1900) {
    const chunks = [];
    let buf = "";
    for (const line of String(str).split("\n")) {
        // +1 pour le \n qu’on va remettre
        if (buf.length + line.length + 1 > max) {
            if (buf) chunks.push(buf);
            // si une ligne est plus longue que max (rare), on la coupe en durs
            while (line.length > max) {
                chunks.push(line.slice(0, max));
                line = line.slice(max);
            }
            buf = line;
        } else {
            buf += (buf ? "\n" : "") + line;
        }
    }
    if (buf) chunks.push(buf);
    return chunks;
}

async function sendChunked(
    interaction,
    text,
    { code = null, ephemeral = true } = {}
) {
    const chunks = chunkText(text, 1900);
    if (!chunks.length) return;

    const wrap = (c, lang) => (lang ? `\`\`\`${lang}\n${c}\n\`\`\`` : c);

    // premier chunk -> editReply
    await interaction.editReply({ content: wrap(chunks[0], code) });

    // suivants -> followUp
    for (let i = 1; i < chunks.length; i++) {
        await interaction.followUp({ content: wrap(chunks[i], code), ephemeral });
    }
}

/* ------------------ Lecture messages (bilingue + forwards) ------------------ */
async function collectEmbedsDeep(message) {
    const embeds = [...(message.embeds || [])];

    if (message.reference?.messageId) {
        try {
            const ref = await message.fetchReference();
            for (const e of ref.embeds || []) embeds.push(e);
        } catch { }
    }

    const seen = new Set();
    const unique = [];
    for (const e of embeds) {
        const h = `${e.title || ""}|${e.description || ""}|${JSON.stringify(
            e.fields || []
        )}`;
        if (seen.has(h)) continue;
        seen.add(h);
        unique.push(e);
    }
    return unique;
}

async function getDailyTransactions(channel, date) {
    let transactions = [];
    let lastMessageId = null;
    const targetDate = date;

    while (true) {
        const options = { limit: 100 };
        if (lastMessageId) options.before = lastMessageId;

        const messages = await channel.messages.fetch(options);
        if (!messages.size) break;

        let stopFetching = false;

        for (const message of messages.values()) {
            const embeds = await collectEmbedsDeep(message);
            if (!embeds.length) continue;

            for (const embed of embeds) {
                const t = await extractTransactionData(embed, channel.client, message);
                if (!t) continue;

                if (t.date === targetDate) {
                    transactions.push({
                        ...t,
                        messageId: message.id,
                        messageUrl: message.url,
                    });
                } else {
                    const [d, m, y] = (t.date || "").split("/");
                    const [td, tm, ty] = (targetDate || "").split("/");
                    if (d && m && y && td && tm && ty) {
                        const transTime = new Date(`${y}-${m}-${d}`);
                        const targetTime = new Date(`${ty}-${tm}-${td}`);
                        if (transTime < targetTime) {
                            stopFetching = true;
                            break;
                        }
                    }
                }
            }
            if (stopFetching) break;
        }

        if (stopFetching) break;
        lastMessageId = messages.last().id;
    }

    return transactions.sort((a, b) => a.messageId.localeCompare(b.messageId));
}

async function getTransactionsBetweenDates(channel, startDate, endDate) {
    let transactions = [];
    let lastMessageId = null;

    const [sd, sm, sy] = startDate.split("/");
    const [ed, em, ey] = endDate.split("/");
    const startTime = new Date(`${sy}-${sm}-${sd}`);
    const endTime = new Date(`${ey}-${em}-${ed}`);

    while (true) {
        const options = { limit: 100 };
        if (lastMessageId) options.before = lastMessageId;

        const messages = await channel.messages.fetch(options);
        if (!messages.size) break;

        let stopFetching = false;

        for (const message of messages.values()) {
            const embeds = await collectEmbedsDeep(message);
            if (!embeds.length) continue;

            for (const embed of embeds) {
                const t = await extractTransactionData(embed, channel.client, message);
                if (!t) continue;

                const [d, m, y] = (t.date || "").split("/");
                if (!(d && m && y)) continue;
                const transTime = new Date(`${y}-${m}-${d}`);

                if (transTime >= startTime && transTime < endTime) {
                    transactions.push({
                        ...t,
                        messageId: message.id,
                        messageUrl: message.url,
                    });
                }
                if (transTime < startTime) {
                    stopFetching = true;
                    break;
                }
            }
            if (stopFetching) break;
        }

        if (stopFetching) break;
        lastMessageId = messages.last().id;
    }

    return transactions.sort((a, b) => a.messageId.localeCompare(b.messageId));
}

/* ------------------ Format/Export ------------------ */
function formatNumberFR(value) {
    return value === undefined || value === null || value === ""
        ? ""
        : String(value).replace(".", ",");
}

function buildRowFromTransaction(t) {
    if (t.type === "Vente") {
        return [
            t.date || "", // Date A
            t.type || "", // Type B
            t.buyerId || "", // Discord ID C
            t.buyerTag || "", // Discord Tag D
            t.vouchId || "", // Vouch N° E
            "", // From F
            "", // MO G
            "", // To H
            "", // MD I
            "", // Frais J
            t.item || "", // Item K
            t.quantity || "", // Quantité L
            "", // Prix unité M
            formatNumberFR(t.totalPrice) || "", // Prix de vente N
        ];
    } else if (t.type === "Exchange") {
        return [
            t.date || "", // Date A
            t.type || "", // Type B
            t.buyerId || "", // Discord ID C
            t.buyerTag || "", // Discord Tag D
            t.vouchId || "", // Vouch N° E
            t.fromMethod || "", // From F
            formatNumberFR(t.fromAmount) || "", // MO G
            t.toMethod || "", // To H
            formatNumberFR(t.toAmount) || "", // MD I
            t.fromMethod?.toLowerCase() === "paysafecard"
                ? formatNumberFR((parseFloat(t.fromAmount || 0) * 0.05).toFixed(2))
                : "", // Frais J
            "", // Item K
            "", // Quantité L
            "", // Prix unité M
            "", // Prix de vente N
        ];
    } else {
        return [t.date || "", t.type || "", JSON.stringify(t)];
    }
}

async function exportTransactionsToSheet(sheetName, transactions) {
    if (!transactions?.length) return { added: 0, skipped: 0 };

    const existingRows = await readSheetAll(`${sheetName}!A2:Z`);
    const existingSet = new Set();
    for (const row of existingRows) {
        if (row[16]) existingSet.add(String(row[16]).trim()); // Q: messageUrl
        if (row[4]) existingSet.add(String(row[4]).trim()); // E: vouchId
    }

    const newRows = [];
    let skipped = 0;
    for (const t of transactions) {
        const uniqueId = (t.messageUrl || t.vouchId || "").trim();
        if (uniqueId && existingSet.has(uniqueId)) {
            skipped++;
            continue;
        }
        const row = buildRowFromTransaction(t);
        while (row.length < 17) row.push("");
        newRows.push(row);
    }

    if (!newRows.length) return { added: 0, skipped };
    const appendResult = await appendRowsBatch(sheetName, "A2", newRows);
    return { added: appendResult.updatedRows || newRows.length, skipped };
}

/* ------------------ Commande ------------------ */
module.exports = {
    name: "compta",
    category: "developer",
    permissions: ["DEVELOPER"],
    usage: "compta <transaction|jour|periode> [options]",
    examples:
        "compta transaction --message_id 123456789012345678\ncompta jour --date 01/01/2023\ncompta periode --start 01/08/2025 --end 12/08/2025",
    description: "Gestion des transactions comptables",
    options: [
        {
            name: "transaction",
            description: "Extraire les données d'une transaction spécifique",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "message_id",
                    description: "ID du message",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: "jour",
            description: "Liste toutes les transactions pour une date",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "date",
                    description: "JJ/MM/AAAA",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "export",
                    description: "Exporter vers Google Sheets",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                },
            ],
        },
        {
            name: "periode",
            description:
                "Liste toutes les transactions entre deux dates (fin exclue)",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "start",
                    description: "JJ/MM/AAAA",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "end",
                    description: "JJ/MM/AAAA",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "export",
                    description: "Exporter vers Google Sheets",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                },
            ],
        },
    ],

    async runInteraction(client, interaction) {
        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.channel;

        await interaction.deferReply({ ephemeral: true });

        try {
            if (subcommand === "transaction") {
                const messageId = interaction.options.getString("message_id");
                const message = await channel.messages
                    .fetch(messageId)
                    .catch(() => null);
                if (!message) return interaction.editReply("Message introuvable.");
                const embeds = await collectEmbedsDeep(message);
                if (!embeds.length)
                    return interaction.editReply(
                        "Aucun embed trouvé (même dans le message référencé)."
                    );

                // on envoie en chunk si besoin
                for (const e of embeds) {
                    const t = await extractTransactionData(e, client, message);
                    if (t) {
                        const payload = JSON.stringify(t, null, 2);
                        await sendChunked(interaction, payload, {
                            code: "json",
                            ephemeral: true,
                        });
                        return;
                    }
                }
                return interaction.editReply(
                    "Impossible d'extraire la transaction de cet embed."
                );
            }

            if (subcommand === "jour") {
                const date = interaction.options.getString("date");
                const shouldExport = interaction.options.getBoolean("export") || false;
                const transactions = await getDailyTransactions(channel, date);
                if (!transactions.length)
                    return interaction.editReply(
                        `Aucune transaction trouvée pour le ${date}.`
                    );

                if (shouldExport) {
                    await initGoogleSheets();
                    const { added, skipped } = await exportTransactionsToSheet(
                        "Septembre",
                        transactions
                    );
                    return interaction.editReply(
                        `Export terminé : ${added} ajoutées, ${skipped} ignorées (doublons).`
                    );
                } else {
                    const payload = JSON.stringify(transactions, null, 2);
                    await sendChunked(interaction, payload, {
                        code: "json",
                        ephemeral: true,
                    });
                    return;
                }
            }

            if (subcommand === "periode") {
                const start = interaction.options.getString("start");
                const end = interaction.options.getString("end");
                const shouldExport = interaction.options.getBoolean("export") || false;
                const transactions = await getTransactionsBetweenDates(
                    channel,
                    start,
                    end
                );
                if (!transactions.length)
                    return interaction.editReply(
                        `Aucune transaction trouvée entre le ${start} et ${end}.`
                    );

                if (shouldExport) {
                    await initGoogleSheets();
                    const { added, skipped } = await exportTransactionsToSheet(
                        "Septembre",
                        transactions
                    );
                    return interaction.editReply(
                        `Export terminé : ${added} ajoutées, ${skipped} ignorées (doublons).`
                    );
                } else {
                    const payload = JSON.stringify(transactions, null, 2);
                    await sendChunked(interaction, payload, {
                        code: "json",
                        ephemeral: true,
                    });
                    return;
                }
            }
        } catch (err) {
            console.error("[compta] erreur:", err);
            return interaction.editReply(`Erreur : ${err.message || err}`);
        }
    },
};
