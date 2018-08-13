# oauth2-server-jwt

[![Build Status](https://travis-ci.org/compwright/oauth2-server-jwt.svg?branch=master)](https://travis-ci.org/compwright/oauth2-server-jwt) [![Greenkeeper badge](https://badges.greenkeeper.io/compwright/oauth2-server-jwt.svg)](https://greenkeeper.io/)

Model mixin for [oauth2-server](https://github.com/compwright/node-oauth2-server) to generate access tokens in JWT format

## Requirements

* Node.js 8+
* [oauth2-server](https://github.com/compwright/node-oauth2-server)

## Installation

```bash
$ npm install --save @compwright/oauth2-server oauth2-server-jwt
```

## Usage

```javascript
const OAuth2Server = require('@compwright/oauth2-server');
const jwt = require('oauth2-server-jwt');

const oauth = new OAuth2Server({
    model: {
        ...jwt({
            jwtid,      // Function({ client, user, scope })
            secret,     // String
            issuer,     // String
            expiresIn,  // Number
            audience,   // String|Function({ client, user, scope })
            payload,    // String|Function({ client, user, scope })
            subject     // String|Function({ client, user, scope })
        })
    }
});
```

Default configuration:

Claim   |   Value
--------|--------
`jti`   | 32-char cryptographically-secure random string
`aud`   | `client.id`
`sub`   | `user` (note: you must pass in a `subject({ client, user, scope})` getter function if you expect `user` to be an object)
payload | `{ user }`

## License

MIT license
