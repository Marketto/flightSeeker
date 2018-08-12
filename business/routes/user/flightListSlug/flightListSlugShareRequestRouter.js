const express = require('express');
const router = express.Router({
    mergeParams: true
});
const mongo = require('../../../connectors/mongo');
const ObjectID = require('mongodb').ObjectID;
const {
    OBJECT_ID_ROUTE_MATCHER
} = require('../../routingConst');

function logErr(err) {
    console.error(err);
    res.sendStatus(500);
}

function modifySucceded(req, res) {
    console.log("[modifySucceded]");
    res.sendStatus(204);
}

function newFlightListShareRequest(req, res, next) {
    console.log("[newFlightListShareRequest]");
    if (req.flightListPermissions.shareRequest.add) {
        const flightListSlug = req.params.flightListSlug;
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
        //FlightList Slug exists but user doesn't have rights to read
        res.sendStatus(401);
    }
}

function deleteFlightListShareRequest(req, res, next) {
    console.log("[deleteFlightListShare]");
    if (req.flightListPermissions.shareRequest.remove) {
        const flightListSlug = req.params.flightListSlug;
        const shareRequestUserId = new ObjectID(req.params.userId);

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
        //FlightList Slug exists but user doesn't have rights to read
        res.sendStatus(401);
    }
}


router.get('/', (req, res) => res.sendStatus(501));

router.delete(`/:userId(${OBJECT_ID_ROUTE_MATCHER})`, deleteFlightListShareRequest);
router.post('/', newFlightListShareRequest);


module.exports = router;