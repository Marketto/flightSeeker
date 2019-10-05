const express = require('express');
const router = express.Router({ mergeParams: true });
const mongo = require('../../../connectors/mongo');
const slug = require('slug');
const flightListSlugRouter = require('./slug/flightListSlugRouter');
const {
    SLUG_MATCHER_ROUTE_MATCHER
} = require('../../routingConst');


function logErr(err) {
    console.error(err);
}

function getAllFlightLists(req, res, next) {
    console.log("[getAllFlightLists]");
    mongo().then(db => {
        // eslint-disable-next-line no-underscore-dangle
        const userId = req.user._id;
        db.collection('flightLists').find({
            '$or': [
                {
                    'owner': userId
                },
                {
                    'shared': userId
                }
            ]
        }, {
            _id: 0,
            flights: 0,
            owner: 0,
            shared: 0
        }).toArray().then((flightLists = []) => {
            req.allflightLists = flightLists;
            next();
        }, logErr);
    }, logErr);
}

function resAllFlightLists(req, res) {
    res.send(req.allflightLists);
}

function newFlightList(req, res, next) {
    console.log("[postFlightList]");

    mongo().then(db => {
        const flName = req.body.name;
        const flSlug = req.body.slug || slug(req.body.name);
        const flFlights = req.body.flights || [];
        // eslint-disable-next-line no-underscore-dangle
        const ownerId = req.user._id;

        const newFligthList = {
            'name': flName,
            'slug': flSlug,
            'owner': ownerId,
            'shared': [],
            'shareRequest': [],
            'flights': flFlights
        };
        db.collection('flightLists').insertOne(newFligthList)
        .then(({
            insertedId
        }) => {
            if (insertedId) {
                res.status(201);
                req.flightList = {
                    '_id': insertedId,
                    'slug': newFligthList.slug
                };
                next();
            } else {
                res.status(409).send({
                    message: "Slug already used"
                });
            }
        }, logErr);
    }, logErr);
}


function checkSlugAndPermissions(req, res, next){
    console.log('[checkSlugAndPermissions]');
    mongo().then(db => {
        const {flightListSlug} = req.params;
        // eslint-disable-next-line no-underscore-dangle
        const userId = req.user._id;

        db.collection('flightLists').aggregate([
            {
                $match: {
                    'slug': flightListSlug
                }
            },
            {
                $limit: 1
            },
            {
                $project: {
                    _id : 1,
                    owner : {
                        $eq : [
                            '$owner',
                            userId
                        ]
                    },
                    shared : {
                        $in : [
                            userId,
                            '$shared'
                        ]
                    },
                    shareRequest : {
                        $in : [
                            userId,
                            '$shareRequest'
                        ]
                    }
                }
            },
            {
                $project: {
                    read: {$or: ['$owner', '$shared']},
                    owner: {
                        read: {$or: ['$owner', '$shared']},
                        change: '$owner'
                    },
                    flights: {
                        read: {$or: ['$owner', '$shared']},
                        add: {$or: ['$owner', '$shared']},
                        remove: {$or: ['$owner', '$shared']}
                    },
                    shared: {
                        read: {$or: ['$owner', '$shared']},
                        add: '$owner',
                        remove: '$owner'
                    },
                    shareRequest: {
                        read: '$owner',
                        add: {$not: {$or: ['$owner', '$shared', '$shareRequest']}},
                        remove: {$or: ['$owner', '$shareRequest']}
                    }
                }
            }
        ]).toArray().then(([flightListPermissions] = []) => {
            if (flightListPermissions) {
                // eslint-disable-next-line no-underscore-dangle
                const id = flightListPermissions._id;
                console.log(`[checkSlugAndPermissions] <${id}> found`);
                req.flightListPermissions = flightListPermissions;
                next();
            } else {
                // FlightList Slug does not exist at all
                res.sendStatus(404);
            }
        }, logErr);
    }, logErr);
}

function resFlightList(req, res) {
    res.send(req.flightList);
}

router.use((req, res, next) => {
    console.log("[flightListRouter]");
    next();
});
router.use(`/:flightListSlug(${SLUG_MATCHER_ROUTE_MATCHER})`, checkSlugAndPermissions, flightListSlugRouter);
router.get('/', getAllFlightLists, resAllFlightLists);
//TODO: Add validation against jsonSchema
router.post('/', newFlightList, resFlightList);

module.exports = router;