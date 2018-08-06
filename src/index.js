const jwt = require('jsonwebtoken');
const { defaultsDeep } = require('lodash');
const getters = require('./getters');

function invokeOrReturn(fn, ...args) {
    return (typeof fn === 'function')
        ? fn(...args)
        : fn;
}

module.exports = (options = {}) => {
    const {
        jwtid,      // Function
        secret,     // String
        issuer,     // String
        expiresIn,  // Number
        audience,   // String|Function
        payload,    // String|Function
        subject     // String|Function
    } = defaultsDeep({}, options, getters);

    if (typeof jwtid !== 'function') {
        throw new Error('Unsafe `jwtid` configuration - use a function to generate a unique identifier');
    }
    
    return {
        // Required for all grant types
        generateAccessToken: (client, user, scope) => {
            const args = { client, user, scope };

            const jwtPayload = invokeOrReturn(payload, args);

            if (client.scopes && scope !== 'UNSUPPORTED') {
                jwtPayload.scopes = scope.split(' ');
            }

            return jwt.sign(jwtPayload, secret, {
                jwtid: jwtid(args),
                issuer: invokeOrReturn(issuer, args),
                expiresIn: invokeOrReturn(expiresIn, args),
                audience: invokeOrReturn(audience, args),
                subject: invokeOrReturn(subject, args),
            });
        }
    };
};
