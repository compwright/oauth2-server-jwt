module.exports = ({ issuer, secret, userId, clientId, type }) => (token, client, user) => ({
    secret,
    issuer,

    get jwtid() {
        switch (type) {
        case 'accessToken':
        case 'refreshToken':
            return token[type];

        case 'authorizationCode':
            return token.code;

        default:
            return undefined;
        }
    },
    
    get exp() {
        switch (type) {
        case 'accessToken':
        case 'refreshToken':
            return Math.floor((token[`${type}ExpiresAt`]) / 1000);

        case 'authorizationCode':
            return Math.floor((token.expiresAt) / 1000);

        default:
            return Math.floor(Date.now() / 1000) + 30; // seconds
        }
    },
    
    get nbf() {
        if (type === 'refreshToken') {
            return Math.floor(token.accessTokenExpiresAt / 1000);
        } else {
            return this.exp - 35;
        }
    },

    get subject() {
        if (typeof user === 'object') {
            if (userId) {
                return String(user[userId]);
            } else {
                throw new Error('Missing userId configuration');
            }
        } else {
            return String(user);
        }
    },

    get audience() {
        if (clientId) {
            return client[clientId];
        } else {
            throw new Error('Missing clientId configuration');
        }
    },
    
    get payload() {
        const payload = { nbf: this.nbf, exp: this.exp, type };

        if (typeof user === 'object') {
            payload.user = user;
        }

        if (token.scope && token.scope !== 'UNSUPPORTED') {
            payload.scope = token.scope;
        }

        return payload;
    }
});
