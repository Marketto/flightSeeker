const express = require('express');
const router = express.Router({
    mergeParams: true
});
const mongo = require('../../../../connectors/mongo');
const flightListSlugFlight = require('./flightListSlugFlightRouter');
const flightListSlugShared = require('./flightListSlugSharedRouter');
const flightListSlugShareRequest = require('./flightListSlugShareRequestRouter');
const {
    cleanProjection
} = require('../../../../services/queryUtilities');

function resFlightList(req, res) {
    console.log("[resFlightList]");
    res.send(req.flightList);
}

function getFlightListBySlug(req, res, next) {
    console.log('[getFlightListBySlug]');
    if (req.flightListPermissions.read) {
        mongo()
            .then(db => {
                console.log('flightLists found');
                const flightListSlug = req.params.flightListSlug;
                
                db.collection('viewFlightLists')
                    .find({
                        'slug': flightListSlug
                    })
                    .toArray()
                    .then(([flightList]) => {
                        req.flightList = flightList;
                        next();
                    })
                    .catch(next);
            })
            .catch(next);
    } else if (req.flightListPermissions.shareRequest.add) {
        //FlightList Slug exists but user doesn't have rights to read
        res.sendStatus(401);
    } else {
        //FlightList Slug exists and share request is pending
        res.sendStatus(406);
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