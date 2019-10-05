const express = require('express');
const router = express.Router({ mergeParams: true });
const mongo = require('../../../connectors/mongo');
const keys = require('../../../keys.json');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');


const checkJwtBody = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: keys.auth0.jwksUri
    }),
    //    audience: keys.auth0.audience,
    issuer: keys.auth0.issuer,
    algorithms: ['RS256'],
    getToken: req => req.body.token
});

function logErr(err) {
    console.error(err);
}

function editUserComplete(req, res){
    console.log("[editUserComplete]");
    res.sendStatus(204);
}

function copyLoggedUserId(req, res, next) {
    console.log("[copyLoggedUserId]");
    // eslint-disable-next-line no-underscore-dangle
    req.loggedUserId = req.user._id;
    next();
}

function addUserAccount (req, res, next){
    console.log("[addUserAccount]");

    const userId = req.loggedUserId;
    const accountId = req.user.sub;
    Reflect.deleteProperty(req, 'loggedUserId');

    mongo().then(db => {
        db.collection('users').updateOne({
            '_id' : userId
        }, {
            $addToSet: {
                'account' : accountId
            }
        }).then(()=>{
            console.log("[addUserAccount] <added>");
            next();
        }, logErr);
    }, logErr);

}
/*
function removeUserAccount (req, res, next){
}
*/

router.put('/', copyLoggedUserId, checkJwtBody, addUserAccount, editUserComplete);
// TODO
// router.delete('/:accountId', removeUserAccount, editUserComplete);

module.exports = router;