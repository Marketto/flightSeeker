const express = require('express');
const router = express.Router({ mergeParams: true });
const mongo = require('../../../../connectors/mongo');
const flightRouter = require('../../../aviation/flightRouter');
const {
    FLIGHT_UUID_ROUTE_MATCHER
} = require('../../../routingConst');

function logErr(err) {
    console.error(err);
}

function modifySucceded(req, res) {
    console.log("[modifySucceded]");
    res.sendStatus(204);
}

function insertUuidToFlightList(req, res, next) {
    console.log("[insertUuidToFlightList]");
    if (req.flightListPermissions.flights.add) {
        const {flightListSlug} = req.params;
        const flightUUID = req.flights[0].uuid;

        mongo().then(db => {
            db.collection('flightLists').updateOne({
                'slug': flightListSlug
            }, {
                $addToSet: {
                    'flights': flightUUID
                }
            }).then(() => {
                next();
            }, logErr);
        }, logErr);
    } else {
        // User is not allowed to add flights
        res.sendStatus(401);
    }
}

function deleteUuidFromFlightList(req, res, next) {
    console.log("[deleteUuidFromFlightList]");
    if (req.flightListPermissions.flights.remove) {
        const {flightListSlug, flightUUID} = req.params;

        mongo().then(db => {
            db.collection('flightLists').updateOne({
                'slug': flightListSlug
            }, {
                $pull: {
                    'flights': flightUUID
                }
            }).then(() => {
                next();
            }, logErr);
        }, logErr);
    } else {
        // User is not allowed to remove flights
        res.sendStatus(401);
    }
}


router.use((req, res, next) => {
    console.log("[flightListSlugFlightRouter]");
    next();
});
router.get('/', (req, res) => res.sendStatus(501));
router.delete(
    `/:flightUUID(${FLIGHT_UUID_ROUTE_MATCHER})`,
    deleteUuidFromFlightList,
    modifySucceded
);
router.put(
    `/:flightUUID(${FLIGHT_UUID_ROUTE_MATCHER})`,
    (req, res, next) => {
        req.params.aggregate = false;
        next();
    },
    ...flightRouter.retrieveFlightByUUID,
    insertUuidToFlightList,
    modifySucceded
);

module.exports = router;