const assert = require('assert');
const getters = require('../src/getters');

describe('getters', () => {
    describe('jwtid()', () => {
        const { jwtid } = getters;

        it('should generate a 32-character string', (done) => {
            assert.equal(typeof jwtid(), 'string');
            assert.equal(jwtid().length, 32);
            done();
        });

        it('should not generate the same value each time', (done) => {
            assert.notEqual(jwtid(), jwtid());
            done();
        });
    });

    describe('audience()', () => {
        const { audience } = getters;
        const client = { id: 'asdf' };

        it('should return the client ID', (done) => {
            assert.strictEqual(audience({ client }), client.id);
            done();
        });

        it('should return undefined if client is missing or malformed', (done) => {
            assert.strictEqual(audience(), undefined);
            done();
        });
    });

    describe('payload()', () => {
        const { payload } = getters;
        const client = { id: 'asdf' };
        const user = 'yuio';

        it('should return { user }', (done) => {
            assert.deepEqual(payload({ client, user }), { user });
            done();
        });

        it('should return {} when there is no user', (done) => {
            assert.deepEqual(payload({ client }), {});
            done();
        });
    });

    describe('subject()', () => {
        const { subject } = getters;

        it('should throw if user is an object', (done) => {
            assert.throws(() => {
                subject({ user: { 'name': 'Yogi the Bear' } });
            });
            done();
        });

        it('should return a string', (done) => {
            assert.deepEqual(subject({ user: 1 }), '1');
            done();
        });
    });
});
