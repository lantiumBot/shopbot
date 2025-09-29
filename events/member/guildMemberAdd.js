const { MEMBER_ROLE_ID } = require('../../ids');

module.exports = {
    name: "guildMemberAdd",
    once: false,
    async execute(client, member) {
        const guild = member.guild;
        // ajouter le rôle "Membres" à l'utilisateur
        const role = guild.roles.cache.find(r => r.id === MEMBER_ROLE_ID);
        if (role) {
            member.roles.add(role);
        }
    },
};
