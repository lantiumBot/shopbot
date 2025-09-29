const { ApplicationCommandOptionType } = require("discord.js");
const { google } = require("googleapis");
const path = require("path");
const axios = require("axios");

// ==================== Config ====================
const SELL_AUTH_API = process.env.SELLAUTH_URL;
const SHOP_ID = process.env.SELLAUTH_SHOPID || "153896";
const API_KEY = process.env.SELLAUTH_TOKEN; // NE PAS hardcoder
const PARIS_TZ = "Europe/Paris";

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

// ==================== Utils Dates ====================
// Convertit ISO UTC -> "JJ/MM/AAAA" vu depuis Europe/Paris
function toParisDateString(iso) {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        const fmt = new Intl.DateTimeFormat("fr-FR", {
            timeZone: PARIS_TZ,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
        return fmt.format(d);
    } catch {
        return "";
    }
}

function isoMatchesParisDay(iso, targetJJMMAAAA) {
    return toParisDateString(iso) === targetJJMMAAAA;
}

function nextDayStr(jjmmaaaa) {
    const [d, m, y] = jjmmaaaa.split("/").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    dt.setUTCDate(dt.getUTCDate() + 1);
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const yy = String(dt.getUTCFullYear());
    return `${dd}/${mm}/${yy}`;
}

// Pour période: retourne timestamp Paris début et fin exclus (en UTC)
function parisRangeToUTC(startJJMMAAAA, endJJMMAAAA) {
    const toParisMidnightUTC = (y, m, d) => {
        // 00:00:00 Paris -> obtenir l'équivalent UTC par formattage.
        const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)); // pivot midi
        const fmtHour = new Intl.DateTimeFormat("fr-FR", {
            timeZone: PARIS_TZ,
            hour: "2-digit",
            hour12: false,
        });
        const displayedHour = parseInt(fmtHour.format(dt), 10); // 12 +/- offset
        const offsetHours = displayedHour - 12;
        const utc = Date.UTC(y, m - 1, d, -offsetHours, 0, 0);
        return new Date(utc);
    };

    const [sd, sm, sy] = startJJMMAAAA.split("/").map((v) => parseInt(v, 10));
    const [ed, em, ey] = endJJMMAAAA.split("/").map((v) => parseInt(v, 10));

    return {
        startUTC: toParisMidnightUTC(sy, sm, sd),
        endUTC: toParisMidnightUTC(ey, em, ed),
    };
}

// ==================== HTTP SellAuth ====================
const http = axios.create({
    baseURL: `${SELL_AUTH_API}/v1`,
    timeout: 15000,
    headers: {
        Authorization: `Bearer ${API_KEY}`,
    },
});

// Retry simple (429/5xx) exponentiel
async function withRetry(fn, { tries = 5, baseDelay = 800 } = {}) {
    let attempt = 0;
    let lastErr;
    while (attempt < tries) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            const status = err?.response?.status;
            if (status === 429 || (status >= 500 && status < 600)) {
                const wait = baseDelay * Math.pow(2, attempt);
                await new Promise((r) => setTimeout(r, wait));
                attempt++;
                continue;
            }
            throw err;
        }
    }
    throw lastErr;
}

// ==================== Listing paginé avec arrêt anticipé ====================
async function listInvoiceIdsForDay(jjmmaaaa) {
    if (!API_KEY) throw new Error("SELLAUTH_API_KEY manquant (env).");
    const ids = [];
    const endStr = nextDayStr(jjmmaaaa);
    const { startUTC, endUTC } = parisRangeToUTC(jjmmaaaa, endStr);

    let page = 1;
    while (true) {
        const res = await withRetry(() =>
            http.get(`/shops/${SHOP_ID}/invoices`, {
                params: {
                    "statuses[]": "completed",
                    orderDirection: "desc",
                    page,
                    per_page: 100,
                },
            })
        );
        const body = res.data || {};
        const data = Array.isArray(body.data) ? body.data : [];

        let sawOlder = false;
        for (const inv of data) {
            const dt = new Date(inv.completed_at);
            if (dt >= startUTC && dt < endUTC) ids.push(inv.id);
            if (dt < startUTC) sawOlder = true;
        }

        const cur = Number(body.current_page || page);
        const last = Number(body.last_page || cur);
        if (sawOlder || cur >= last) break;
        page = cur + 1;
    }
    return ids;
}

async function listInvoiceIdsForPeriod(startJJMMAAAA, endJJMMAAAA) {
    if (!API_KEY) throw new Error("SELLAUTH_API_KEY manquant (env).");
    const ids = [];
    const { startUTC, endUTC } = parisRangeToUTC(startJJMMAAAA, endJJMMAAAA);

    let page = 1;
    while (true) {
        const res = await withRetry(() =>
            http.get(`/shops/${SHOP_ID}/invoices`, {
                params: {
                    "statuses[]": "completed",
                    orderDirection: "desc",
                    page,
                    per_page: 100,
                },
            })
        );
        const body = res.data || {};
        const data = Array.isArray(body.data) ? body.data : [];

        let sawOlder = false;
        for (const inv of data) {
            const dt = new Date(inv.completed_at);
            if (dt >= startUTC && dt < endUTC) ids.push(inv.id);
            if (dt < startUTC) sawOlder = true;
        }

        const cur = Number(body.current_page || page);
        const last = Number(body.last_page || cur);
        if (sawOlder || cur >= last) break;
        page = cur + 1;
    }
    return ids;
}

// ==================== Détails par ID + pool ====================
async function fetchInvoiceDetail(id) {
    const res = await withRetry(() => http.get(`/shops/${SHOP_ID}/invoices/${id}`));
    return res.data;
}

// mini-pool (concurrency = 5)
async function mapWithConcurrency(items, fn, concurrency = 5) {
    const out = new Array(items.length);
    let i = 0;
    async function worker() {
        while (true) {
            const idx = i++;
            if (idx >= items.length) break;
            out[idx] = await fn(items[idx], idx);
        }
    }
    const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
    await Promise.all(workers);
    return out;
}

// ==================== Transformations ====================
// Renvoie un tableau de transactions (une ligne par item)
function invoiceDetailToTransactions(inv) {
    const date = toParisDateString(inv.completed_at);
    const vouchId = String(inv.id ?? "").trim();

    const customer = inv.customer || {};
    const discordId = customer.discord_id || "";
    const discordUsername = customer.discord_username || "";

    const items = Array.isArray(inv.items) ? inv.items : [];
    const txs = [];

    for (const it of items) {
        const name =
            it?.product?.name ||
            it?.variant?.name ||
            "Item";

        const qty = it?.quantity != null ? String(it.quantity) : "";

        // N = items.total_price (string)
        const totalStr = it?.total_price ?? null;
        const totalNum = totalStr != null ? Number(String(totalStr).replace(",", ".")) : null;
        const totalFixed = totalNum != null ? totalNum.toFixed(2) : "";

        txs.push({
            date,                 // A
            type: "Vente",        // B
            discordId,            // C
            discordTag: discordUsername, // D
            vouchId,              // E
            item: name,           // K
            quantity: qty,        // L
            totalPrice: totalFixed, // N (normalisé en .; on mettra la virgule à l’écriture)
        });
    }
    return txs;
}

// ==================== Google Sheets helpers ====================
async function safeGoogleCall(fn, ...args) {
    let retries = 6, delay = 1000;
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

function buildRowFromTransaction(t) {
    // A..Q = 17 colonnes
    return [
        t.date || "",                                    // A Date
        "Vente",                                         // B Type (forcé)
        t.discordId || "",                               // C Discord ID
        t.discordTag || "",                              // D Discord Tag
        t.vouchId || "",                                 // E Vouch N°
        "",                                              // F From
        "",                                              // G MO
        "",                                              // H To
        "",                                              // I MD
        "",                                              // J Frais
        t.item || "",                                    // K Items (product.name)
        t.quantity || "",                                // L Quantité (items.quantity)
        "",                                              // M Prix unité
        t.totalPrice ? String(t.totalPrice).replace(".", ",") : "", // N Prix de vente (items.total_price)
        "",                                              // O Prix d'achat
        "",                                              // P CA
        "",                                              // Q Perte
    ];
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

// Dédoublonnage sur E+K+L+N (N normalisé en .)
async function exportTransactionsToSheet(sheetName, transactions) {
    if (!transactions?.length) return { added: 0, skipped: 0 };

    const existingRows = await readSheetAll(`${sheetName}!A2:Q`);
    const existingSet = new Set();
    for (const row of existingRows) {
        const e = (row[4] || "").trim();                      // E id
        const k = (row[10] || "").trim();                      // K item
        const l = (row[11] || "").trim();                      // L qty
        const n = (row[13] || "").trim().replace(",", ".");    // N total (normalisé)
        if (e || k || l || n) {
            existingSet.add(`${e}#${k}#${l}#${n}`);
        }
    }

    const newRows = [];
    let skipped = 0;

    for (const t of transactions) {
        const key = `${(t.vouchId || "").trim()}#${(t.item || "").trim()}#${(t.quantity || "").trim()}#${(t.totalPrice || "").trim()}`;
        if (existingSet.has(key)) {
            skipped++;
            continue;
        }
        const row = buildRowFromTransaction(t);
        while (row.length < 17) row.push(""); // A..Q = 17
        newRows.push(row);
    }

    if (!newRows.length) return { added: 0, skipped };
    const appendResult = await appendRowsBatch(sheetName, "A2", newRows);
    return { added: appendResult.updatedRows || newRows.length, skipped };
}

// ==================== Pipelines (IDs -> détails -> items) ====================
async function getSellAuthTransactionsForDay(jjmmaaaa) {
    const ids = await listInvoiceIdsForDay(jjmmaaaa);
    if (!ids.length) return [];
    const details = await mapWithConcurrency(ids, (id) => fetchInvoiceDetail(id), 5);
    return details.flatMap(invoiceDetailToTransactions);
}

async function getSellAuthTransactionsForPeriod(startJJMMAAAA, endJJMMAAAA) {
    const ids = await listInvoiceIdsForPeriod(startJJMMAAAA, endJJMMAAAA);
    if (!ids.length) return [];
    const details = await mapWithConcurrency(ids, (id) => fetchInvoiceDetail(id), 5);
    return details.flatMap(invoiceDetailToTransactions);
}

// ==================== Commande ====================
module.exports = {
    name: "comptasellauth",
    category: "developer",
    permissions: ["DEVELOPER"],
    usage: "comptasellauth <jour|periode> [options]",
    examples:
        ["comptasellauth jour --date 01/09/2025", "comptasellauth periode --start 01/09/2025 --end 12/09/2025 --export true"],
    description: "Gestion des transactions comptables (via SellAuth API)",
    options: [
        {
            name: "jour",
            description: "Liste toutes les transactions SellAuth pour une date",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "date",
                    description: "JJ/MM/AAAA (Europe/Paris)",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "export",
                    description: "Exporter vers Google Sheets",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                },
                {
                    name: "sheet",
                    description: "Nom de l’onglet Google Sheet (ex: Septembre)",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
            ],
        },
        {
            name: "periode",
            description: "Liste toutes les transactions SellAuth entre deux dates (fin exclue)",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "start",
                    description: "JJ/MM/AAAA (inclus)",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "end",
                    description: "JJ/MM/AAAA (exclu)",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "export",
                    description: "Exporter vers Google Sheets",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                },
                {
                    name: "sheet",
                    description: "Nom de l’onglet Google Sheet (ex: Septembre)",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
            ],
        },
    ],

    async runInteraction(client, interaction) {
        const sub = interaction.options.getSubcommand();
        const shouldExport = interaction.options.getBoolean("export") || false;
        const sheetName = interaction.options.getString("sheet") || "Septembre";

        await interaction.deferReply({ ephemeral: true });

        try {
            if (sub === "jour") {
                const date = interaction.options.getString("date"); // JJ/MM/AAAA Paris
                const transactions = await getSellAuthTransactionsForDay(date);

                if (!transactions.length) {
                    return interaction.editReply(`Aucune transaction SellAuth (completed) pour le ${date}.`);
                }

                if (shouldExport) {
                    await initGoogleSheets();
                    const { added, skipped } = await exportTransactionsToSheet(sheetName, transactions);
                    return interaction.editReply(`Export terminé : ${added} ajoutées, ${skipped} ignorées (doublons).`);
                } else {
                    const payload = JSON.stringify(transactions, null, 2);
                    if (payload.length < 1900) {
                        return interaction.editReply({ content: "```json\n" + payload + "\n```" });
                    } else {
                        const chunks = payload.match(/[\s\S]{1,1800}/g) || [];
                        await interaction.editReply({ content: "```json\n" + chunks[0] + "\n```" });
                        for (let i = 1; i < chunks.length; i++) {
                            await interaction.followUp({ content: "```json\n" + chunks[i] + "\n```", ephemeral: true });
                        }
                        return;
                    }
                }
            }

            if (sub === "periode") {
                const start = interaction.options.getString("start");
                const end = interaction.options.getString("end");
                const transactions = await getSellAuthTransactionsForPeriod(start, end);

                if (!transactions.length) {
                    return interaction.editReply(`Aucune transaction SellAuth entre le ${start} et ${end}.`);
                }

                if (shouldExport) {
                    await initGoogleSheets();
                    const { added, skipped } = await exportTransactionsToSheet(sheetName, transactions);
                    return interaction.editReply(`Export terminé : ${added} ajoutées, ${skipped} ignorées (doublons).`);
                } else {
                    const payload = JSON.stringify(transactions, null, 2);
                    if (payload.length < 1900) {
                        return interaction.editReply({ content: "```json\n" + payload + "\n```" });
                    } else {
                        const chunks = payload.match(/[\s\S]{1,1800}/g) || [];
                        await interaction.editReply({ content: "```json\n" + chunks[0] + "\n```" });
                        for (let i = 1; i < chunks.length; i++) {
                            await interaction.followUp({ content: "```json\n" + chunks[i] + "\n```", ephemeral: true });
                        }
                        return;
                    }
                }
            }

            return interaction.editReply("Sous-commande inconnue.");
        } catch (err) {
            console.error("[compta] erreur:", err?.response?.data || err);
            const msg = err?.response?.data?.message || err?.message || String(err);
            return interaction.editReply(`Erreur SellAuth/Sheets : ${msg}`);
        }
    },
};
