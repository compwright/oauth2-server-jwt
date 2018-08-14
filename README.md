# oauth2-server-jwt

[![Build Status](https://travis-ci.org/compwright/oauth2-server-jwt.svg?branch=master)](https://travis-ci.org/compwright/oauth2-server-jwt) [![Greenkeeper badge](https://badges.greenkeeper.io/compwright/oauth2-server-jwt.svg)](https://greenkeeper.io/)

Storageless JWT token generator backend for [oauth2-server](https://github.com/compwright/node-oauth2-server)

## Features

* Respects oauth2-server token lifetime configuration for each type of token
* Generates JWT access tokens, refresh tokens, and authorization codes

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
    model: jwt({
        accessTokenSecret,                  // String (required)
        refreshTokenSecret,                 // String (required)
        authorizationCodeSecret,            // String (required)
        issuer,                             // String (required)
        userId: 'id'                        // String
        clientId: 'id'                      // String
        clientRedirectUri: 'redirectUri',   // String
        algorithms: ['HS256']               // Array[String]
    })
});
```

## License

MIT license
