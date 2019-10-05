const express = require('express');
const router = express.Router({
    mergeParams: true
});
const mongo = require('../../../../connectors/mongo');
const {ObjectID} = require('mongodb');
const {
    OBJECT_ID_ROUTE_MATCHER
} = require('../../../routingConst');

function logErr(err) {
    console.error(err);
    res.sendStatus(500);
}

function requestAccepted(req, res) {
    console.log("[requestAccepted]");
    res.status(202).send({'message': "Share request has been performed"});
}

function requestRevoked(req, res) {
    console.log("[requestRevoked]");
    res.sendStatus(204);
}

function requestRefused(req, res) {
    console.log("[requestRefused]");
    res.sendStatus(204);
}

function newFlightListShareRequest(req, res, next) {
    console.log("[newFlightListShareRequest]");
    if (req.flightListPermissions.shareRequest.add) {
        const {flightListSlug} = req.params;
        // eslint-disable-next-line no-underscore-dangle
        const requestUserId = req.user._id;

        mongo().then(db => {
            db.collection('flightLists').updateOne({
                'slug': flightListSlug
            }, {
                $addToSet: {
                    'shareRequest': requestUserId
                }
            }).then(() => {
                next();
            }, logErr);
        }, logErr);
    } else {
        // FlightList Slug exists but user doesn't have rights to read
        res.sendStatus(401);
    }
}

function deleteFlightListShareRequest(req, res, next) {
    console.log("[deleteFlightListShare]");
    if (req.flightListPermissions.shareRequest.remove) {
        const {flightListSlug} = req.params;
        // eslint-disable-next-line no-underscore-dangle
        const shareRequestUserId = req.params.userId ? new ObjectID(req.params.userId) : req.user._id;

        mongo().then(db => {
            db.collection('flightLists').updateOne({
                'slug': flightListSlug
            }, {
                $pull: {
                    'shareRequest': shareRequestUserId
                }
            }).then(() => {
                next();
            }, logErr);
        }, logErr);
    } else {
        // FlightList Slug exists but user doesn't have rights to read
        res.sendStatus(401);
    }
}


router.use((req, res, next) => {
    console.log("[flightListSlugShareRequestRouter]");
    next();
});
router.get('/', (req, res) => res.sendStatus(501));
router.delete(`/`, deleteFlightListShareRequest, requestRevoked);
router.delete(`/:userId(${OBJECT_ID_ROUTE_MATCHER})`, deleteFlightListShareRequest, requestRefused);
router.post('/', newFlightListShareRequest, requestAccepted);


module.exports = router;