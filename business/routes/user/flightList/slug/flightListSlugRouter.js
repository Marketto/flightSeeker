const express = require('express');
const router = express.Router({
    mergeParams: true
});
const mongo = require('../../../../connectors/mongo');
const flightListSlugFlight = require('./flightListSlugFlightRouter');
const flightListSlugShared = require('./flightListSlugSharedRouter');
const flightListSlugShareRequest = require('./flightListSlugShareRequestRouter');
const {
    flightListFlighAggregation
} = require('../../../../services/flightQueryBuilder');

function logErr(err) {
    console.error(err);
}

function resFlightList(req, res) {
    console.log("[resFlightList]");
    res.send(req.flightList);
}

function getFlightListBySlug(req, res, next) {
    console.log('[getFlightListBySlug]');
    const {flightListPermissions} = req;
    if (flightListPermissions.read) {
        mongo().then(db => {
            console.log('flightLists found');
            const {flightListSlug} = req.params;
            db.collection('flightLists').aggregate(flightListFlighAggregation({
                'slug': flightListSlug
            }).concat({
                '$project' : {
                    'owner'         : Boolean(flightListPermissions.owner.read),
                    'flights'       : Boolean(flightListPermissions.flights.read),
                    'shared'        : Boolean(flightListPermissions.shared.read),
                    'shareRequest'  : Boolean(flightListPermissions.shareRequest.read),
                    'name'          : Boolean(flightListPermissions.read),
                    'slug'          : 1
                }
            }))
            .toArray()
            .then(([flightList]) => {
                req.flightList = flightList;
                next();
            }).catch(logErr);
        }).catch(logErr);
    } else if (flightListPermissions.shareRequest.add) {
        // FlightList Slug exists but user doesn't have rights to read
        res.sendStatus(401);
    } else {
        // FlightList Slug exists and share request is pending
        res.sendStatus(406);
    }
}

function logRoute(req, res, next){
    console.log("[flightListSlugRoute]");
    next();
}


router.use((req, res, next) => {
    console.log("[flightListSlugRouter]");
    next();
});
router.use('/flight', logRoute, flightListSlugFlight);
router.use('/shared', logRoute, flightListSlugShared);
router.use('/shareRequest', logRoute, flightListSlugShareRequest);
router.get('/', getFlightListBySlug, resFlightList);
// TODO
router.delete('/', (req, res) => res.sendStatus(501));


module.exports = router;