const express = require('express');
const router = express.Router();
const keys = require('../../keys.json');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const mongo = require('../../services/mongo');
const flightListRouter = require('./flightListRouter');

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

function logErr(err){
    console.error(err);
    res.sendStatus(500);
}

function getDbUser(req, res, next) {
    const accountId = req.user.sub;
    console.log("[getDbUser]");
    mongo().then(db => {
        const usersCollection = db.collection('users');

        usersCollection.findOne({
            'account' : accountId
        }).then(dbUser => {
            if (dbUser) {
                req.user._id = dbUser._id;
                next();
            } else {
                usersCollection.insertOne({
                    'account': [accountId]
                }).then(({insertedId}) => {
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

function resUser(req, res) {
    console.log("[resDbUser]");
    res.send(req.user)
}

router.get('/', checkJwt, getDbUser, resUser);
/*router.get('/:userId', checkJwt, getDbUser, (req, res) => {
    //TODO
    res.send(req.user)
});*/
router.use('/flight-list', checkJwt, getDbUser, flightListRouter);

module.exports = router;