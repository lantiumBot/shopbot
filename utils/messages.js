module.exports = {
  vendorNotFound: {
    fr: "❌ Ce vendeur ne fait pas partie de la liste des vendeurs du serveur.",
    en: "❌ This seller is not in the list of server vendors.",
  },
  priceInvalid: {
    fr: "❌ Le prix doit être un nombre positif.",
    en: "❌ The price must be a positive number.",
  },
  priceDecimals: {
    fr: "❌ Le prix doit avoir au maximum deux décimales.",
    en: "❌ The price must have a maximum of two decimals.",
  },
  unknownError: {
    fr: "❌ Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer.",
    en: "❌ An error occurred when processing your request. Please try again.",
  },
  anonymousRepSent: {
    fr: "✅ Votre vouch anonyme a été envoyé avec succès.",
    en: "✅ Your anonymous vouch was sent with success.",
  },
  repSent: {
    fr: "✅ Votre vouch a été envoyé avec succès.",
    en: "✅ Your vouch was sent with success.",
  },
  twoDecimalsOnly: {
    fr: "❌ Ce montant doit avoir au maximum deux décimales.",
    en: "❌ This amount must have a maximum of two decimals.",
  },
  invalidOrigine: {
    fr: "❌ Le montant d'origine est invalide.",
    en: "❌ The origin amount is invalid.",
  },
  invalidDestination: {
    fr: "❌ Le montant de destination est invalide.",
    en: "❌ The destination amount is invalid.",
  },
  ticketUnknownType: {
    fr: "Type de ticket inconnu.",
    en: "Unknown ticket type.",
  },
  ticketErrorCreating: {
    fr: "Erreur : Impossible de créer le salon. Vérifiez les permissions du bot.",
    en: "Error: Unable to create the channel. Check the bot's permissions.",
  },
  ticketChannelNotCreated: {
    fr: "Erreur : Le salon du ticket n'a pas pu être créé.",
    en: "Error: The ticket channel could not be created.",
  },
  ticketEmbedDescription: {
    fr: "Merci d'avoir ouvert un ticket, il sera bientôt pris en charge par un vendeur.",
    en: "Thank you for opening a ticket, it will be taken care of soon by a seller.",
  },
  ticketFooter: {
    fr: "Merci de patienter et de fournir toutes les informations nécessaires.",
    en: "Please wait and provide all necessary information.",
  },
  ticketPaymentMethods: {
    fr: `Voici les moyens de paiements disponibles :
<:Paypal:1384850210668154890> - **PayPal**
💳 - **Carte Bancaire** Revolut
<:BTC:1384850180951507008> - **Bitcoin (BTC)**
<:LTC:1384850201122045982> - **Litecoin (LTC)**
<:Paysafecard:1384850221317754981> - **Paysafecard** (Minimum 10€) (5% de frais)

**Pas de bonjour, pas de réponse.**`,
    en: `Here are the available payment methods:
<:Paypal:1384850210668154890> - **PayPal**
💳 - **Bank Card** Revolut
<:BTC:1384850180951507008> - **Bitcoin (BTC)**
<:LTC:1384850201122045982> - **Litecoin (LTC)**
<:Paysafecard:1384850221317754981> - **Paysafecard** (Minimum €10) (5% fee)

**No Hello, No Answer.**`,
  },
  closeTicketButton: {
    fr: "Fermer le Ticket",
    en: "Close Ticket",
  },
  ticketWait: {
    fr: "ce ticket est en attente !",
    en: "this ticket is pending!",
  },
  ticketCreatedMessage: {
    fr: (type, id) => `Votre ticket **${type}** a été créé : <#${id}>`,
    en: (type, id) => `Your **${type}** ticket has been created: <#${id}>`,
  },
  ticketSendError: {
    fr: "Erreur : Le message n'a pas pu être envoyé dans le salon du ticket.",
    en: "Error: The message could not be sent in the ticket channel.",
  },
  PaiementTitle: {
    fr: "Moyen de paiement Midnight Supply",
    en: "Midnight Supply Payment Method",
  },
  Paypal: {
    fr: "PayPal",
    en: "PayPal",
  },
  VentePaypalValue: {
    fr: "```midnightsupplypro@lantium.fr```\n **Amis Proches/Famille**\n **Pas de note**",
    en: "```midnightsupplypro@lantium.fr```\n **Friends & Family only**\n **No comment/message**",
  },
  ExchangePaypalValue: {
    fr: "```midnightsupplypro@lantium.fr```\n **Amis Proches/Famille**\n **Pas de note**",
    en: "```midnightsupplypro@lantium.fr```\n **Friends & Family only**\n **No comment/message**",
  },
  Revolut: {
    fr: "Revolut (paiement CB)",
    en: "Revolut (Bank Card Payment)",
  },
  RevolutValue: {
    fr: "```https://revolut.me/lantium```",
    en: "```https://revolut.me/lantium```",
  },
  LTC: {
    fr: "LTC - Merci de fournir le TX ID",
    en: "LTC - Please provide TX ID",
  },
  LTCValue: {
    fr: "```LZJ6vJiV6mAoTLPwPzfCU4BJqQEoWJ8Rre```",
    en: "```LZJ6vJiV6mAoTLPwPzfCU4BJqQEoWJ8Rre```",
  },
  Paysafecard: {
    fr: "Paysafecard",
    en: "Paysafecard",
  },
  PaysafecardValue: {
    fr: "```Merci de me ping ! Minimum 10€```",
    en: "```Please ping me! Minimum €10```",
  },
  ShopFooter: {
    fr: "Alekseii - Midnight Supply",
    en: "Alekseii - Midnight Supply",
  },
  vouchSuccessDesc: {
    fr: (vouchCommand, repChannelId) =>
      `Midnight Supply vous remercie pour votre achat.\nNous vous invitons à effectuer une vouch dans le salon <#${repChannelId}>.\n\nNous vous rappelons que la vouch est obligatoire et sans elle, nous ne pourrons pas vous aider en cas de problème.\n\nMerci de votre compréhension et à bientôt sur Midnight Supply !\n\nLa commande pour vouch est \`${vouchCommand}\`.`,
    en: (vouchCommand, repChannelId) =>
      `Midnight Supply thanks you for your purchase.\nWe invite you to leave a vouch in the channel <#${repChannelId}>.\n\nPlease note that vouching is mandatory. Without it, we won't be able to help you in case of any issue.\n\nThank you for your understanding, and see you soon on Midnight Supply !\n\nThe vouch command is \`${vouchCommand}\`.`,
  },
  sendaccountInvalidFormat: {
    fr: "Les informations fournies ne sont pas valides. Assurez-vous de respecter le format : mail:password:token.",
    en: "The provided information is invalid. Make sure the format is: mail:password:token.",
  },
  sendaccountUnknownProvider: {
    fr: "Le fournisseur spécifié n'est pas reconnu. Veuillez choisir entre 'Oblivision' ou 'Iancu'.",
    en: "The specified provider is not recognized. Please choose either 'Oblivision' or 'Iancu'.",
  },
  sendaccountOk: {
    fr: "Message envoyé en privé, merci de vérifier vos messages privés.",
    en: "Private message sent, please check your DMs.",
  },
  sendaccountDmFailed: {
    fr: "Échec de l'envoi du message en privé.",
    en: "Failed to send private message.",
  },
  sendaccountOblivision: {
    fr: (email, password, token) => `
Merci d'avoir acheté un compte Discord chez nous !

Pour modifier les informations d'identification du compte Discord :

1. Connectez-vous : https://swiftmail.cc/
2. Connectez-vous en utilisant les informations d'identification fournies :
  - Email
  - Mot de passe
3. Après vous être connecté, veuillez changer l'adresse électronique du compte Discord par celle de votre choix.

Si vous avez des questions ou besoin d'aide, contactez-nous. Amusez-vous bien avec votre nouveau compte !

__**Mail :**__ ${email}
__**Mot de passe :**__ ${password}
__**Token :**__ ${token}
`,
    en: (email, password, token) => `
Thank you for purchasing a Discord account from us!

To update your Discord account credentials:

1. Login: https://swiftmail.cc/
2. Sign in with the credentials provided:
   - Email
   - Password
3. Once logged in, change the Discord account email to one of your choice.

If you have any questions or need help, feel free to contact us. Enjoy your new account!

__**Email :**__ ${email}
__**Password :**__ ${password}
__**Token :**__ ${token}
`
  },
  sendaccountIancu: {
    fr: (email, password, token) => `
Merci d'avoir acheté un compte Discord chez nous !

Pour modifier les informations d'identification du compte Discord :

1. Connectez-vous : https://firstmail.ltd/en-US/webmail/login
2. Connectez-vous en utilisant les informations d'identification fournies :
  - Email
  - Mot de passe
3. Après vous être connecté, veuillez changer l'adresse électronique du compte Discord par celle de votre choix.

Si vous avez des questions ou besoin d'aide, contactez-nous. Amusez-vous bien avec votre nouveau compte !

__**Mail :**__ ${email}
__**Mot de passe :**__ ${password}
__**Token :**__ ${token}
`,
    en: (email, password, token) => `
Thank you for purchasing a Discord account from us!

To update your Discord account credentials:

1. Login: https://firstmail.ltd/en-US/webmail/login
2. Sign in with the credentials provided:
   - Email
   - Password
3. Once logged in, change the Discord account email to one of your choice.

If you have any questions or need help, feel free to contact us. Enjoy your new account!

__**Email :**__ ${email}
__**Password :**__ ${password}
__**Token :**__ ${token}
`
  },
  reservationMemberNotFound: {
    fr: "Le membre spécifié n'existe pas dans ce serveur.",
    en: "The specified member does not exist in this server.",
  },
  reservationLog: {
    fr: (memberId, nombre, paiement) =>
      `<@${memberId}> | ${memberId} = ${nombre} nitro réservé via ${paiement}`,
    en: (memberId, nombre, paiement) =>
      `<@${memberId}> | ${memberId} = ${nombre} nitro reserved via ${paiement}`,
  },
  reservationSaved: {
    fr: "La réservation a été enregistrée.",
    en: "The reservation has been saved.",
  },
  reservationLogNotFound: {
    fr: "Le salon de log des réservations n'a pas été trouvé.",
    en: "Reservation log channel not found.",
  },
  reservationError: {
    fr: "Une erreur est survenue lors de la réservation. Veuillez réessayer plus tard.",
    en: "An error occurred during the reservation. Please try again later.",
  },
  attenteNotTicket: {
    fr: "Cette commande ne peut être utilisée que dans un ticket.",
    en: "This command can only be used inside a ticket.",
  },
  attenteCategoryUnknown: {
    fr: "Catégorie non reconnue.",
    en: "Unknown category.",
  },
  attenteSuccess: {
    fr: (label) => `Le ticket a été déplacé vers la catégorie ${label}.`,
    en: (label) => `The ticket has been moved to the ${label} category.`,
  },
  attenteError: {
    fr: "Une erreur est survenue lors du déplacement du ticket.",
    en: "An error occurred while moving the ticket.",
  },
  repNotVendor: {
    fr: "❌ Ce vendeur ne fait pas partie de la liste des vendeurs du serveur.",
    en: "❌ This user is not a registered vendor in this server.",
  },
  repPriceNaN: {
    fr: "❌ Le prix doit être un nombre positif.",
    en: "❌ Price must be a positive number.",
  },
  repTwoDecimals: {
    fr: "❌ Le prix doit avoir au maximum deux décimales.",
    en: "❌ Price must have at most two decimal places.",
  },
  repOrigineTwoDecimals: {
    fr: "❌ Le montant d'origine doit avoir au maximum deux décimales.",
    en: "❌ Source amount must have at most two decimal places.",
  },
  repDestinationTwoDecimals: {
    fr: "❌ Le montant de destination doit avoir au maximum deux décimales.",
    en: "❌ Destination amount must have at most two decimal places.",
  },
  repAnonSuccess: {
    fr: "✅ Votre vouch anonyme a été envoyé avec succès.",
    en: "✅ Your anonymous vouch has been successfully sent.",
  },
  repError: {
    fr: "❌ Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer.",
    en: "❌ An error occurred while processing your request. Please try again.",
  },
  percentMissingArgs: {
    fr: "Merci de préciser le montant et le pourcentage. Exemple: +calc 50 5%",
    en: "Please specify the amount and percentage. Example: +calc 50 5%",
  },
  percentAmountNaN: {
    fr: "Le montant doit être un nombre valide.",
    en: "The amount must be a valid number.",
  },
  percentPercentNaN: {
    fr: "Le pourcentage doit être un nombre valide. Exemple: 5%",
    en: "The percentage must be a valid number. Example: 5%",
  },
  percentResult: {
    fr: (amount, percentage, fee, rendu) =>
      `Les frais pour ${amount}€ à ${percentage}% sont de : ${fee}€. Tu recevras donc : ${rendu}€`,
    en: (amount, percentage, fee, rendu) =>
      `Fees for ${amount}€ at ${percentage}% are: ${fee}€. You will receive: ${rendu}€`,
  },
  percentEmbedTitle: {
    fr: "Calcul de pourcentage",
    en: "Percentage Calculation",
  },
  percentEmbedAmount: {
    fr: "Montant",
    en: "Amount",
  },
  percentEmbedPercent: {
    fr: "Pourcentage",
    en: "Percentage",
  },
  percentEmbedFee: {
    fr: "Frais",
    en: "Fee",
  },
  percentEmbedReceive: {
    fr: "Montant net",
    en: "Net amount",
  },
  // === SHOP / PRICES (FR/EN) ===
  shop: {
    nitroBoost: {
      title: { fr: "N1tr0 B00st — Tarifs", en: "N1tr0 B00st — Rates" },
      blurb: {
        fr:
          "* Illégal - Gift Link - 1 mois →  Prix variable (entre 2.50€ et 4.40€)\n" +
          "* Legal - Login - 1 mois       →  4.50€/u\n" +
          "* Legal - Gift Link - 1 mois   →  7.80€/u\n" +
          "* Legal - Login - 1 an         →  50€/u",
        en:
          "* Illegal - Gift Link - 1 month →  Variable price (between €2.50 and €4.40)\n" +
          "* Legal - Login - 1 month       →  €4.50 /u\n" +
          "* Legal - Gift Link - 1 month   →  €7.80 /u\n" +
          "* Legal - Login - 1 year        →  €50 /u\n",
      },
      note: { fr: "Tarifs évolutifs selon stock et promos.", en: "Prices evolve with stock and promos." },
    },

    decoration: {
      gift: {
        title: { fr: "D3c0r4t10n — Gift Link", en: "D3c0r4t10n — Gift Link" },
        blurb: {
          fr: "Merci de fournir les URLs des décorations voulues :",
          en: "Please provide the URLs of the decorations you want:",
        },
        ratesBlock: {
          fr:
            "```text\n" +
            "4,99 €  →  2,45 €\n" +
            "5,99 €  →  3,25 €\n" +
            "6,99 €  →  3,50 €\n" +
            "7,99 €  →  4,35 €\n" +
            "8,49 €  →  4,75 €\n" +
            "9,99 €  →  5,60 €\n" +
            "11,99 € →  6,20 €\n" +
            "```",
          en:
            "```text\n" +
            "€4.99  →  €2.45\n" +
            "€5.99  →  €3.25\n" +
            "€6.99  →  €3.50\n" +
            "€7.99  →  €4.35\n" +
            "€8.49  →  €4.75\n" +
            "€9.99  →  €5.60\n" +
            "€11.99 →  €6.20\n" +
            "```",
        },
        note: { fr: "Les prix peuvent bouger avec les promos.", en: "Prices may change with promos." },
      },
      login: {
        title: { fr: "D3c0r4t10n — Pack en login", en: "D3c0r4t10n — Login Pack" },
        blurb: {
          fr: "Pack direct sur compte (login) :",
          en: "Pack applied directly on your account (login):",
        },
        ratesBlock: {
          fr:
            "```text\n" +
            "8,99 €   →  5,60 €\n" +
            "10,99 €  →  6,90 €\n" +
            "13,99 €  →  8,80 €\n" +
            "17,99 €  →  11,00 €\n" +
            "21,99 €  →  13,50 €\n" +
            "```",
          en:
            "```text\n" +
            "€8.99   →  €5.60\n" +
            "€10.99  →  €6.90\n" +
            "€13.99  →  €8.80\n" +
            "€17.99  →  €11.00\n" +
            "€21.99  →  €13.50\n" +
            "```",
        },
        note: {
          fr: "Via AnyDesk ou envoi du compte en MP, possibilité d’être en vocal.",
          en: "Via AnyDesk or send the account in DM; voice possible.",
        },
      },
    },

    serverBoost: {
      title: { fr: "Serveur Boost — Tarifs", en: "Server Boost — Rates" },
      blurb: {
        fr: "```text\n" +
          "2 boosts - 1 mois       →  0,18 €\n" +
          "14 boosts - 1 mois      →  1,20 €\n" +
          "20 boosts - 1 mois      →  2 €\n" +
          "```",
        en:
          "```text\n" +
          "2 boosts - 1 month       →  €0.18\n" +
          "14 boosts - 1 month      →  €1.20\n" +
          "20 boosts - 1 month      →  €2\n" +
          "```",
      },
      note: {
        fr: "Pour les personnes aux UAE, +1€ de frais supplémentaires sur Paypal biens & services.",
        en: "For people in the UAE, +€1 extra fee on Paypal goods & services.",
      },
    },

    nitroToken: {
      title: { fr: "Nitro Tokens — Tarifs", en: "Nitro Tokens — Rates" },
      blurb: {
        fr:
          "```text\n" +
          "1 token - 1 mois       →  0,18 €\n" +
          "+ 100 tokens - 1 mois  →  -10% réduction\n" +
          "```",
        en:
          "```text\n" +
          "1 token - 1 month       →  €0.18\n" +
          "+ 100 tokens - 1 month  →  -10% discount\n" +
          "```",
      },
      note: { fr: "Tarifs évolutifs selon annonce.", en: "Prices may change with announcements." },
    },

    exchange: {
      title: { fr: "Exchanges — Tarifs", en: "Exchanges — Rates" },
      blurb: { fr: "Toutes les options dispo :", en: "All available options:" },
      ppToCrypto: { fr: "PayPal ou Carte → Crypto", en: "PayPal or Card → Crypto" },
      c2c: { fr: "Crypto → Crypto", en: "Crypto → Crypto" },
      other: { fr: "Autres", en: "Other" },
      ppToCryptoBlock: {
        fr:
          "```text\n" +
          "-10 €   →  8% de frais\n" +
          "-20 €   →  6% de frais\n" +
          "+20 €   →  5% de frais\n" +
          "+50 €   →  4% de frais\n" +
          "+300 €  →  3% de frais\n" +
          "+400 €  →  2,5% de frais\n" +
          "```",
        en:
          "```text\n" +
          "-10 €   →  8% fee\n" +
          "-20 €   →  6% fee\n" +
          "+20 €   →  5% fee\n" +
          "+50 €   →  4% fee\n" +
          "+300 €  →  3% fee\n" +
          "+400 €  →  2.5% fee\n" +
          "```",
      },
      c2cBlock: {
        fr:
          "```text\n" +
          "-10 €   →  10% de frais\n" +
          "-20 €   →  8% de frais\n" +
          "+20 €   →  7% de frais\n" +
          "+50 €   →  6% de frais\n" +
          "+300 €  →  5% de frais\n" +
          "+400 €  →  4% de frais\n" +
          "```",
        en:
          "```text\n" +
          "-10 €   →  10% fee\n" +
          "-20 €   →  8% fee\n" +
          "+20 €   →  7% fee\n" +
          "+50 €   →  6% fee\n" +
          "+300 €  →  5% fee\n" +
          "+400 €  →  4% fee\n" +
          "```",
      },
      otherBlock: {
        fr:
          "```text\n" +
          "Crypto → PayPal        → 2€ de frais\n" +
          "Paysafecard → PayPal   → 8% de frais\n" +
          "Paysafecard → Crypto   → 10% de frais\n" +
          "```",
        en:
          "```text\n" +
          "Crypto → PayPal        → €2 fee\n" +
          "Paysafecard → PayPal   → 8% fee\n" +
          "Paysafecard → Crypto   → 10% fee\n" +
          "```",
      },
      note: {
        fr: "Minimum 15€ pour BTC • 25€ pour ETH • 31€ pour XRP",
        en: "Minimum €15 for BTC • €25 for ETH • €31 for XRP",
      },
    },

    tagUsername: {
      title: { fr: "Tag Username — Prix", en: "Tag Username — Prices" },
      blurb: {
        fr:
          "* Random Tag 4 lettres (rgfd)             →  0,30 €\n" +
          "* Random Tag 4 caractères (1con)          →  0,30 €\n" +
          "* Tag UHQ FR (argent | riche | propriete) →  3 €\n",
        en:
          "* Random Tag 4 letters (rgfd)             →  €0.30\n" +
          "* Random Tag 4 characters (1con)          →  €0.30\n" +
          "* Tag UHQ FR (argent | riche | propriete) →  €3\n"
      },
      note: { fr: "C’est aléatoire.", en: "It’s random." },
    },

    tempSms: {
      title: { fr: "Temp SMS — Tarifs", en: "Temp SMS — Rates" },
      blurb: {
        fr:
          "```text\n" +
          "Discord  →  0,30 €\n" +
          "Apple    →  0,50 €\n" +
          "Snapchat →  0,50 €\n" +
          "Google   →  0,70 €\n" +
          "Vinted   →  0,40 €\n" +
          "```",
        en:
          "```text\n" +
          "Discord  →  €0.30\n" +
          "Apple    →  €0.50\n" +
          "Snapchat →  €0.50\n" +
          "Google   →  €0.70\n" +
          "Vinted   →  €0.40\n" +
          "```",
      },
      note: {
        fr: "Tu veux un autre service ? Demande et je te donne le prix.",
        en: "Want another service? Ask and I’ll quote it.",
      },
    },

    topup: {
      title: { fr: "Top-Up — Tarifs", en: "Top-Up — Rates" },
      blurb: { fr: "16 000 IDR → 1 €", en: "16,000 IDR → €1" },
      note: { fr: "(Recharge minimum 10€)", en: "(Minimum charge €10)" },
    },

    account: {
      title: { fr: "4cc0unt — Tarifs", en: "4cc0unt — Rates" },
      note: {
        fr: "Information : Comptes fournis avec accès à la boîte mail.",
        en: "Info: Accounts shipped with mailbox access.",
      },
      yearsBlock: {
        fr:
          "```text\n" +
          "2015  →  60 €\n" +
          "2016  →  7 €\n" +
          "2017  →  4 €\n" +
          "2018  →  2,50 €\n" +
          "2019  →  1,50 €\n" +
          "2020  →  1 €\n" +
          "2021  →  0,80 €\n" +
          "2022  →  0,70 €\n" +
          "2023  →  0,60 €\n" +
          "2024  →  0,50 €\n" +
          "2025  →  0,40 €\n" +
          "```",
        en:
          "```text\n" +
          "2015  →  €60\n" +
          "2016  →  €7\n" +
          "2017  →  €4\n" +
          "2018  →  €2.50\n" +
          "2019  →  €1.50\n" +
          "2020  →  €1\n" +
          "2021  →  €0.80\n" +
          "2022  →  €0.70\n" +
          "2023  →  €0.60\n" +
          "2024  →  €0.50\n" +
          "2025  →  €0.40\n" +
          "```",
      }
    },
    accountfivem: {
      title: { fr: "Five M 4cc0unt — Tarifs", en: "Five M 4cc0unt — Rates" },
      kindsBlock: {
        fr:
          "```text\n" +
          "Fresh Account + FA        →  0,40 €\n" +
          "Semi Fresh Account + FA   →  0,15 €\n" +
          "```",
        en:
          "```text\n" +
          "Fresh Account + FA        →  €0.40\n" +
          "Semi Fresh Account + FA   →  €0.15\n" +
          "```",
      },
    },
  },
};
