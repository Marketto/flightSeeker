const express = require('express');
const router = express.Router({
    mergeParams: true
});
const mongo = require('../../../connectors/mongo');
const flightListSlugFlight = require('./flightListSlugFlightRouter');
const flightListSlugShared = require('./flightListSlugSharedRouter');
const flightListSlugShareRequest = require('./flightListSlugShareRequestRouter');
const {
    flightAggregation
} = require('../../../services/flightQueryBuilder');
const {
    cleanProjection
} = require('../../../services/queryUtilities');

function logErr(err) {
    console.error(err);
    res.sendStatus(500);
}

function resFlightList(req, res) {
    console.log("[resFlightList]");
    res.send(req.flightList);
}

function getFlightListBySlug(req, res, next) {
    console.log('[getFlightListBySlug]');
    if (req.flightListPermissions.read) {
        mongo().then(db => {
            console.log('flightLists found');
            const flightListSlug = req.params.flightListSlug;
            
            db.collection('flightLists').aggregate(flightAggregation({
                'slug': flightListSlug
            }).concat({
                '$project' : cleanProjection({
                    'owner'         : req.flightListPermissions.owner.read,
                    'flights'       : req.flightListPermissions.flights.read,
                    'shared'        : req.flightListPermissions.shared.read,
                    'shareRequest'  : req.flightListPermissions.shareRequest.read
                })
            }))
            .toArray()
            .then(([flightList]) => {
                req.flightList = flightList;
                next();
            }, logErr);
        }, logErr);
    } else {
        //FlightList Slug exists but user doesn't have rights to read
        res.sendStatus(401);
    }
}

function logRoute(req, res, next){
    console.log("[flightListSlugRoute]");
    next();
}


router.use('/flight', logRoute, flightListSlugFlight);
router.use('/shared', logRoute, flightListSlugShared);
router.use('/shareRequest', logRoute, flightListSlugShareRequest);
router.get('/', getFlightListBySlug, resFlightList);
// TODO
router.delete('/', (req, res) => res.sendStatus(501));


module.exports = router;