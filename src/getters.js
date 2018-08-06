const crypto = require('crypto');
const { get, pick } = require('lodash');

function jwtid() {
    return crypto.randomBytes(16).toString('hex');
}

function audience(args) {
    return get(args, 'client.id');
}

function payload(args) {
    return pick(args, ['user']) || {};
}

function subject({ user }) {
    if (typeof user === 'object') {
        throw new Error('`subject` getter is required when `user` is an object');
    } else {
        return String(user);
    }
}

module.exports = {
    jwtid,
    audience,
    payload,
    subject
};
