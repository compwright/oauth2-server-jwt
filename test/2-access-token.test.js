const assert = require('assert');
const { has } = require('lodash');
const { verify } = require('jsonwebtoken');
const mixin = require('../');

describe('Access Tokens', () => {
    const client = {
        id: 'acme'
    };

    const user = {
        name: 'pilot'
    };

    const token = {
        accessToken: '12345',
        accessTokenExpiresAt: new Date(Date.now() + 10000),
        scope: 'read write'
    };

    const settings = {
        issuer: 'oauth-jwt',
        accessTokenSecret: 'asdf1234',
        userId: 'name'
    };

    const api = mixin(settings);

    describe('saveToken()', async () => {
        it('should return the expected object format', async () => {
            const newToken = await api.saveToken(token, client, user);
            assert(has(newToken, 'accessToken'));
            assert(has(newToken, 'accessTokenExpiresAt'));
            assert(has(newToken, 'scope'));
            assert(has(newToken, 'client'));
            assert(has(newToken, 'user'));
        });

        it('should convert the accessToken to a JWT', async () => {
            const newToken = await api.saveToken(token, client, user);
            
            const { iat, exp, aud, iss, sub, jti, ...custom } = verify(newToken.accessToken, settings.accessTokenSecret);

            assert.equal(typeof newToken.accessToken, 'string');
            assert(iat < exp);
            assert.equal(typeof exp, 'number');
            assert.deepStrictEqual(custom.scope, token.scope);
            assert.deepEqual(custom.user, user);
            assert.strictEqual(sub, user[settings.userId]);
            assert.strictEqual(aud, client.id);
            assert.strictEqual(iss, settings.issuer);
            assert.strictEqual(jti, token.accessToken);
        });
    });

    describe('getAccessToken()', () => {
        it('should return the expected object format', async () => {
            const res = await api.saveToken(token, client, user);
            res.accessTokenExpiresAt = new Date(1000 * Math.floor(res.accessTokenExpiresAt / 1000)); // round to nearest second, since JWT doesn't do milliseconds
            const newToken = await api.getAccessToken.call({ client }, res.accessToken);
            assert.deepEqual(res, { ...newToken, client, user });
        });

        it('should throw InvalidTokenError when invalid', (done) => {
            api.getAccessToken.call({ client }, 'abc').then(() => {
                done(new Error('Expected exception'));
            }).catch(err => {
                assert.equal(err.name, 'invalid_token');
                done();
            }).catch(done);
        });
    });
});
