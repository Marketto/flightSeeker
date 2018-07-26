const express = require('express');
const router = express.Router();
const keys = require('../../keys.json');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const mongo = require('../../connectors/mongo');

const checkJwtRouting = jwt({
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

function logErr(err) {
    console.error('[authUser]', err);
    res.sendStatus(500);
}

function getDbUserHandler(req, res, next) {
    const accountId = req.user.sub;
    console.log("[getDbUser]");
    mongo().then(db => {
        const usersCollection = db.collection('users');

        usersCollection.findOne({
            'account': accountId
        }).then(dbUser => {
            if (dbUser) {
                req.user._id = dbUser._id;
                next();
            } else {
                usersCollection.insertOne({
                    'account': [accountId]
                }).then(({
                    insertedId
                }) => {
                    if (insertedId) {
                        req.user._id = insertedId;
                        next();
                    } else {
                        logErr('Unable to create user');
                    }
                }, logErr);
            }
        }, logErr)
    }, logErr);
}

module.exports = router.use(
    checkJwtRouting,
    getDbUserHandler
);