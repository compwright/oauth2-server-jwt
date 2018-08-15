const jwt = require('jsonwebtoken');
const promisify = require('promisify-any');
const InvalidTokenError = require('@compwright/oauth2-server/lib/errors/invalid-token-error');
const InvalidClientError = require('@compwright/oauth2-server/lib/errors/invalid-client-error');
const generator = require('./generator');

const signAsync = promisify(jwt.sign, 3);
const verifyAsync = promisify(jwt.verify, 3);

module.exports = (options = {}) => {
    const {
        issuer,
        accessTokenSecret,
        refreshTokenSecret,
        authorizationCodeSecret,
        userId = 'id',
        clientRedirectUri = 'redirectUri',
        algorithms = ['HS256']
    } = options;

    const authorizationCode = generator({
        type: 'authorizationCode',
        secret: authorizationCodeSecret,
        issuer, userId
    });
    
    const accessToken = generator({
        type: 'accessToken',
        secret: accessTokenSecret,
        issuer, userId
    });
    
    const refreshToken = generator({
        type: 'refreshToken',
        secret: refreshTokenSecret,
        issuer, userId
    });
    
    return {
        saveToken: async function(token, client, user) {
            const newToken = { ...token, client, user };

            // eslint-disable-next-line no-unused-vars
            const { payload, secret, nbf, exp, ...params } = accessToken(token, client, user);
            newToken.accessToken = await signAsync(payload, secret, params);

            if (token.refreshToken) {
                // eslint-disable-next-line no-unused-vars
                const { payload, secret, nbf, exp, ...params } = refreshToken(token, client, user);
                newToken.refreshToken = await signAsync(payload, secret, params);
            }

            return newToken;
        },

        saveAuthorizationCode: async function(code, client, user) {
            const newCode = { ...code, client, user };

            // eslint-disable-next-line no-unused-vars
            const { payload, secret, nbf, exp, ...params } = authorizationCode(code, client, user);
            newCode.code = await signAsync(payload, secret, params);

            return newCode;
        },

        getAccessToken: async function(token) {
            try {
                var { exp, aud, type, scope, user } = await verifyAsync(token, accessTokenSecret, {
                    algorithms,
                    issuer
                });
            } catch (e) {
                throw new InvalidTokenError();
            }

            if (type !== 'accessToken') {
                throw new InvalidTokenError();
            }

            if (this.getClient) {
                try {
                    var client = aud && await this.getClient(aud, null);
                    if (!client) {
                        throw new Error();
                    }
                } catch (e) {
                    throw new InvalidClientError();
                }
            }

            return {
                accessToken: token,
                accessTokenExpiresAt: new Date(exp * 1000),
                scope,
                client: client || { id: aud },
                user
            };
        },

        getRefreshToken: async function(token) {
            try {
                var { exp, aud, type, scope, user } = await verifyAsync(token, refreshTokenSecret, {
                    algorithms,
                    issuer
                });
            } catch (e) {
                throw new InvalidTokenError();
            }

            if (type !== 'refreshToken') {
                throw new InvalidTokenError();
            }

            if (this.getClient) {
                try {
                    var client = aud && await this.getClient(aud, null);
                    if (!client) {
                        throw new Error();
                    }
                } catch (e) {
                    throw new InvalidClientError();
                }
            }

            return {
                refreshToken: token,
                refreshTokenExpiresAt: new Date(exp * 1000),
                scope,
                client: client || { id: aud },
                user
            };
        },

        getAuthorizationCode: async function(code) {
            if (!clientRedirectUri) {
                throw new Error('Missing clientRedirectUri configuration');
            }

            try {
                var { exp, aud, type, redirectUri, scope, user } = await verifyAsync(code, authorizationCodeSecret, {
                    algorithms,
                    issuer
                });
            } catch (e) {
                throw new InvalidTokenError();
            }

            if (type !== 'authorizationCode') {
                throw new InvalidTokenError();
            }

            if (this.getClient) {
                try {
                    var client = aud && await this.getClient(aud, null);
                    if (!client) {
                        throw new Error();
                    }
                } catch (e) {
                    throw new InvalidClientError();
                }
            }

            return {
                code,
                expiresAt: new Date(exp * 1000),
                redirectUri,
                scope,
                client: client || { id: aud },
                user
            };
        },

        // eslint-disable-next-line no-unused-vars
        revokeToken: function(token) {
            return false; // not supported
        },

        // eslint-disable-next-line no-unused-vars
        revokeAuthorizationCode: function(code) {
            return false; // not supported
        },

        verifyScope: function(token, scope) {
            if (!token.scope) {
                return false;
            }

            const requestedScopes = scope.split(' ');
            const authorizedScopes = token.scope.split(' ');
            return requestedScopes.every(s => authorizedScopes.indexOf(s) >= 0);
        }
    };
};
