const assert = require('assert');
const { has } = require('lodash');
const { verify } = require('jsonwebtoken');
const mixin = require('../');

describe('Authorization Codes', () => {
    const client = {
        id: 'acme',
        redirectUri: 'https://oauth.test/redirect'
    };

    const user = {
        name: 'pilot'
    };

    const code = {
        authorizationCode: '12345',
        expiresAt: new Date(Date.now() + 1000),
        redirectUri: client.redirectUri,
        scope: 'read write'
    };

    const settings = {
        issuer: 'oauth-jwt',
        authorizationCodeSecret: 'asdf1234',
        userId: 'name'
    };

    const api = mixin(settings);

    describe('saveAuthorizationCode()', async () => {
        it('should return the expected object format', async () => {
            const newCode = await api.saveAuthorizationCode(code, client, user);
            assert(has(newCode, 'authorizationCode'));
            assert(has(newCode, 'expiresAt'));
            assert(has(newCode, 'scope'));
            assert(has(newCode, 'client'));
            assert(has(newCode, 'user'));
        });

        it('should convert the authorizationCode to a JWT', async () => {
            const newCode = await api.saveAuthorizationCode(code, client, user);
            
            const { iat, exp, aud, iss, sub, jti, ...custom } = verify(newCode.authorizationCode, settings.authorizationCodeSecret);

            assert.equal(typeof newCode.authorizationCode, 'string');
            assert(iat < exp);
            assert.equal(typeof exp, 'number');
            assert.deepStrictEqual(custom.scope, code.scope);
            assert.deepEqual(custom.user, user);
            assert.strictEqual(sub, user[settings.userId]);
            assert.strictEqual(aud, client.id);
            assert.strictEqual(iss, settings.issuer);
            assert.strictEqual(jti, code.authorizationCode);
        });
    });

    describe('getAuthorizationCode()', () => {
        it('should return the expected object format', async () => {
            let { authorizationCode, ...res } = await api.saveAuthorizationCode(code, client, user);

            res.expiresAt = new Date(1000 * Math.floor(res.expiresAt / 1000)); // round to nearest second, since JWT doesn't do milliseconds

            const newCode = await api.getAuthorizationCode.call({ client }, authorizationCode);
            assert.deepEqual({ ...res, code: authorizationCode }, { ...newCode, client, user });
        });

        it('should throw InvalidTokenError when invalid', (done) => {
            api.getAuthorizationCode.call({ client }, 'abc').then(() => {
                done(new Error('Expected exception'));
            }).catch(err => {
                assert.equal(err.name, 'invalid_token');
                done();
            }).catch(done);
        });
    });

    describe('revokeAuthorizationCode()', () => {
        it('should always return false', () => {
            assert(!api.revokeAuthorizationCode());
        });
    });
});
