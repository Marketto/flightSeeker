const express = require('express');
const router = express.Router({ mergeParams: true });
const mongo = require('../../connectors/mongo');
const flightRouter = require('../aviation/flightRouter');
const {
    flightAggregation
    //,enrichFlight
} = require('../../services/flightQueryBuilder');
const {
    FLIGHT_UUID_ROUTE_MATCHER
} = require('../routingConst');

function logErr(err) {
    console.error(err);
    res.sendStatus(500);
}

function modifySucceded(req, res) {
    console.log("[modifySucceded]");
    res.sendStatus(204);
}

function resFlightList(req, res) {
    console.log("[resFlightList]");
    res.send(req.flightList);
}

function userSlugQuery(userId, flightListSlug) {
    return {
        '$or': [{
                'owner': userId
            },
            {
                'shared': userId
            }
        ],
        'slug': flightListSlug
    };
}

function insertUuidToFlightList(req, res, next) {
    console.log("[insertUuidToFlightList]");

    const userId = req.user._id;
    const flightListSlug = req.params.flightListSlug;
    const flightUUID = req.flights[0].uuid;

    mongo().then(db => {
        db.collection('flightLists').updateOne(
            userSlugQuery(userId, flightListSlug), {
                $addToSet: {
                    'flights': flightUUID
                }
            }).then(() => {
            next();
        }, logErr);
    }, logErr);
}

function deleteUuidToFlightList(req, res, next) {
    console.log("[deleteUuidToFlightList]");

    const userId = req.user._id;
    const flightListSlug = req.params.flightListSlug;
    const flightUUID = req.params.flightUUID;

    mongo().then(db => {
        db.collection('flightLists').updateOne(
            userSlugQuery(userId, flightListSlug), {
                $pull: {
                    'flights': flightUUID
                }
            }).then(() => {
            next();
        }, logErr);
    }, logErr);
}

function getFlightListBySlug(req, res, next) {
    console.log('[getFlightListBySlug]');

    const userId = req.user._id;
    const flightListSlug = req.params.flightListSlug;

    mongo().then(db => {
        db.collection('flightLists').findOne(
            userSlugQuery(userId, flightListSlug), {
                _id: 0
            }
        ).then(flightList => {
            if (flightList) {
                console.log('flightLists found');
                const flightUUIDs = flightList.flights;
                db.collection('flights').aggregate(flightAggregation({
                        uuid: {
                            $in: flightUUIDs
                        }
                    })).sort({
                        "departure.dateTime": 1
                    }) /*.map(enrichFlight)*/
                    .toArray()
                    .then(flights => {
                        console.log('flightLists flights found');
                        req.flightList = Object.assign(flightList, { flights });
                        next();
                    }, logErr);
            } else {
                res.sendStatus(404);
            }
        }, logErr);
    }, logErr);
}

router.get('/', getFlightListBySlug, resFlightList);


router.delete(
    `/flight/:flightUUID(${FLIGHT_UUID_ROUTE_MATCHER})`,
    deleteUuidToFlightList,
    modifySucceded
);
router.use(
    `/flight`,
    (req, res, next) => {
        req.params.aggregate = false;
        next();
    },
    flightRouter,
    insertUuidToFlightList,
    modifySucceded
);

module.exports = router;