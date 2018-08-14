const assert = require('assert');
const { has } = require('lodash');
const { verify } = require('jsonwebtoken');
const mixin = require('../');

describe('Refresh Tokens', () => {
    const client = {
        id: 'acme'
    };

    const user = {
        name: 'pilot'
    };

    const token = {
        accessToken: '12345',
        accessTokenExpiresAt: new Date(Date.now()),
        refreshToken: '54321',
        refreshTokenExpiresAt: new Date(Date.now() + 1000000),
        scope: 'read write'
    };

    const settings = {
        issuer: 'oauth-jwt',
        accessTokenSecret: 'asdf1234',
        refreshTokenSecret: 'asdf12345678',
        userId: 'name'
    };

    const api = mixin(settings);

    describe('saveToken()', async () => {
        it('should return the expected object format', async () => {
            const newToken = await api.saveToken(token, client, user);
            assert(has(newToken, 'refreshToken'));
            assert(has(newToken, 'refreshTokenExpiresAt'));
            assert(has(newToken, 'scope'));
            assert(has(newToken, 'client'));
            assert(has(newToken, 'user'));
        });

        it('should convert the refreshToken to a JWT', async () => {
            const newToken = await api.saveToken(token, client, user);
            
            const { iat, exp, aud, iss, sub, jti, ...custom } = verify(newToken.refreshToken, settings.refreshTokenSecret);

            assert.equal(typeof newToken.refreshToken, 'string');
            assert(iat < exp);
            assert.equal(typeof exp, 'number');
            assert.deepStrictEqual(custom.scope, token.scope);
            assert.deepEqual(custom.user, user);
            assert.strictEqual(sub, user[settings.userId]);
            assert.strictEqual(aud, client.id);
            assert.strictEqual(iss, settings.issuer);
            assert.strictEqual(jti, token.refreshToken);
        });
    });

    describe('getRefreshToken()', () => {
        it('should return the expected object format', async () => {
            const res = await api.saveToken(token, client, user);

            delete res.accessToken;
            delete res.accessTokenExpiresAt;
            res.refreshTokenExpiresAt = new Date(1000 * Math.floor(res.refreshTokenExpiresAt / 1000)); // round to nearest second, since JWT doesn't do milliseconds

            const newToken = await api.getRefreshToken.call({ client }, res.refreshToken);
            assert.deepEqual(res, { ...newToken, client, user });
        });

        it('should throw InvalidTokenError when invalid', (done) => {
            api.getRefreshToken.call({ client }, 'abc').then(() => {
                done(new Error('Expected exception'));
            }).catch(err => {
                assert.equal(err.name, 'invalid_token');
                done();
            }).catch(done);
        });
    });

    describe('revokeToken()', () => {
        it('should always return false', () => {
            assert(!api.revokeToken());
        });
    });
});
