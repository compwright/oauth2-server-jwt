const assert = require('assert');
const generator = require('../src/generator');

describe('JWT claim generators', () => {
    describe('jwtid()', () => {
        it('should use the accessToken value for access tokens', (done) => {
            const at = generator({ type: 'accessToken' });
            const t1 = { accessToken: 'asdf1234' };
            assert.strictEqual(at(t1).jwtid, 'asdf1234');
            done();
        });

        it('should use the refreshToken value for refresh tokens', (done) => {
            const rt = generator({ type: 'refreshToken' });
            const t2 = { refreshToken: 'qwer5678' };
            assert.strictEqual(rt(t2).jwtid, 'qwer5678');
            done();
        });

        it('should use the code value for authorization codes', (done) => {
            const ac = generator({ type: 'authorizationCode' });
            const t3 = { authorizationCode: 'zxcv6789' };
            assert.strictEqual(ac(t3).jwtid, 'zxcv6789');
            done();
        });

        it('should default to undefined', (done) => {
            assert.strictEqual(generator({})({}).jwtid, undefined);
            done();
        });
    });

    describe('exp()', () => {
        it('should use the accessTokenExpiresAt value for access tokens', (done) => {
            const at = generator({ type: 'accessToken' });
            const t1 = { accessTokenExpiresAt: new Date(Date.now() + 5000) };
            assert.strictEqual(at(t1).exp, Math.floor(t1.accessTokenExpiresAt / 1000));
            done();
        });

        it('should use the refreshTokenExpiresAt value for refresh tokens', (done) => {
            const rt = generator({ type: 'refreshToken' });
            const t2 = { refreshTokenExpiresAt: new Date(Date.now() + 2000) };
            assert.strictEqual(rt(t2).exp, Math.floor(t2.refreshTokenExpiresAt / 1000));
            done();
        });

        it('should use the expiresAt value for authorization codes', (done) => {
            const ac = generator({ type: 'authorizationCode' });
            const t3 = { expiresAt: new Date(Date.now() + 3000) };
            assert.strictEqual(ac(t3).exp, Math.floor(t3.expiresAt / 1000));
            done();
        });

        it('should default to 30 seconds', (done) => {
            assert.strictEqual(generator({})({}).exp, Math.floor(Date.now() / 1000) + 30);
            done();
        });
    });

    describe('nbf()', () => {
        it('should use the accessTokenExpiresAt value for refresh tokens', (done) => {
            const at = generator({ type: 'refreshToken' });
            const t1 = { accessTokenExpiresAt: new Date(Date.now() + 5000) };
            assert.strictEqual(at(t1).nbf, Math.floor(t1.accessTokenExpiresAt / 1000));
            done();
        });

        it('should default to a past timestamp', (done) => {
            assert(generator({})({}).nbf < Math.round(Date.now() / 1000));
            done();
        });
    });

    describe('subject()', () => {
        const user = { id: 1 };
        const accessToken = generator({ userId: 'id' });

        it('should return the string value of the user object property specified by userId', (done) => {
            assert.strictEqual(accessToken({}, {}, user).subject, String(user.id));
            done();
        });

        it('should throw if user is an object and userId is not configured', (done) => {
            assert.throws(() => {
                generator({})({}, {}, {}).subject;
            });
            done();
        });

        it('should return a string if the user is not an object', (done) => {
            assert.strictEqual(accessToken({}, {}, user).subject, '1');
            done();
        });
    });

    describe('audience()', () => {
        const client = { id: 'asdf' };
        const accessToken = generator({
            clientId: 'id'
        });

        it('should return the client ID', (done) => {
            assert.strictEqual(accessToken({}, client).audience, client.id);
            done();
        });

        it('should throw if clientId is not configured', (done) => {
            assert.throws(() => {
                generator({})({}).audience;
            });
            done();
        });
    });

    describe('payload()', () => {
        it('should include the token type', (done) => {
            const type = 'bingo';
            const jwt = generator({ type })({});
            const iat = Math.floor(Date.now() / 1000);
            const nbf = iat - 1;
            const exp = iat + 30;
            assert.deepEqual(jwt.payload, { type, exp, nbf, iat });
            done();
        });

        it('should include the scope if supported', (done) => {
            const scope = 'read';
            const jwt1 = generator({})({ scope });
            const jwt2 = generator({})({ scope: 'UNSUPPORTED' });
            const iat = Math.floor(Date.now() / 1000);
            const nbf = iat - 1;
            const exp = iat + 30;
            assert.deepEqual(jwt1.payload, { type: undefined, scope, exp, nbf, iat });
            assert.deepEqual(jwt2.payload, { type: undefined, exp, nbf, iat });
            done();
        });
    });
});
