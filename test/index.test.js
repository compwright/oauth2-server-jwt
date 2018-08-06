const assert = require('assert');
const { has } = require('lodash');
const { verify } = require('jsonwebtoken');
const model = require('../src/index');

describe('model', () => {
    it('should return { generateAccessToken() }', (done) => {
        assert(has(model(), 'generateAccessToken'));
        assert.equal(typeof model().generateAccessToken, 'function');
        done();
    });

    it('should throw if jwtid is constant', (done) => {
        assert.throws(() => {
            model({ jwtid: 'asdf' });
        });
        done();
    });

    describe('generateAccessToken()', () => {
        it('should generate a JWT', (done) => {
            const client = {
                id: 'test',
                scopes: 'read write delete'.split(' ')
            };

            const settings = {
                jwtid: () => 'foo',
                secret: 'asdf',
                issuer: 'bar',
                expiresIn: 1500
            };

            const { generateAccessToken } = model(settings);

            const token = generateAccessToken(client, 1000, 'read write');
            const { user, scopes, iat, exp, aud, iss, sub, jti } = verify(token, settings.secret);

            assert.equal(typeof token, 'string');
            assert(iat + 1500 === exp);
            assert.equal(typeof exp, 'number');
            assert.deepStrictEqual(scopes, ['read', 'write']);
            assert.strictEqual(user, 1000);
            assert.strictEqual(sub, '1000');
            assert.strictEqual(aud, client.id);
            assert.strictEqual(iss, settings.issuer);
            assert.strictEqual(jti, settings.jwtid());
            done();
        });
    });
});
