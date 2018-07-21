const express = require('express');
const router = express.Router();
const keys = require('../../keys.json');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const jwtAuthz = require('express-jwt-authz');

const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: keys.auth0.jwksUri
    }),
//    audience: keys.auth0.audience,
    issuer: keys.auth0.issuer,
    algorithms: ['RS256']
});

router.get('/', checkJwt, (req, res) => res.send(req.user));

module.exports = router;