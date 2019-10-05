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
}

function modifySucceded(req, res) {
    console.log("[modifySucceded]");
    res.sendStatus(204);
}

function insertFlightListShared(req, res, next) {
    console.log("[insertFlightListShared]");
    if (req.flightListPermissions.shared.add) {
        const {flightListSlug} = req.params;
        const sharingUserId = new ObjectID(req.params.userId);

        console.log(`sharingUserId: ${sharingUserId}`);
        mongo().then(db => {
            db.collection('flightLists').updateOne({
                'slug': flightListSlug
            }, {
                $addToSet: {
                    'shared': sharingUserId
                },
                $pull: {
                    'shareRequest': sharingUserId
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

function deleteFlightListShared(req, res, next) {
    console.log("[deleteFlightListShared]");
    if (req.flightListPermissions.shared.remove) {
        const {flightListSlug} = req.params;
        const sharingUserId = new ObjectID(req.params.userId);

        mongo().then(db => {
            db.collection('flightLists').updateOne({
                'slug': flightListSlug
            }, {
                $pull: {
                    'shared': sharingUserId
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


function logRoute(req, res, next){
    console.log("[flightListSlugSharedRoute]");
    next();
}


router.use((req, res, next) => {
    console.log("[flightListSlugShareRouter]");
    next();
});
router.get('/', logRoute, (req, res) => res.sendStatus(501));
router.delete(`/:userId(${OBJECT_ID_ROUTE_MATCHER})`, logRoute, deleteFlightListShared, modifySucceded);
router.put(`/:userId(${OBJECT_ID_ROUTE_MATCHER})`, logRoute, insertFlightListShared, modifySucceded);


module.exports = router;