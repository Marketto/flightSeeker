const express = require('express');
const router = express.Router({ mergeParams: true });
const mongo = require('../../../connectors/mongo');
const slug = require('slug');
const flightListSlugRouter = require('./slug/flightListSlugRouter');
const {
    SLUG_MATCHER_ROUTE_MATCHER
} = require('../../routingConst');

function getAllFlightLists(req, res, next) {
    console.log("[getAllFlightLists]");
    mongo().then(db => {
        db.collection('viewFlightListsSummary')
        .find({
            '$or': [
                {
                    'owner._id': req.user._id
                },
                {
                    'shared._id': req.user._id
                }
            ]
        }, {
            projection: {
                _id: 0,
                flights: 0,
                owner: 0,
                shared: 0
            }
        })
        .toArray()
        .then((flightLists = []) => {
            req.allflightLists = flightLists;
            next();
        })
        .catch(next);
    })
    .catch(next);
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
        })
        .catch(next);
    })
    .catch(next);
}


function checkSlugAndPermissions(req, res, next){
    console.log('[checkSlugAndPermissions]');
    mongo().then(db => {
        const flightListSlug = req.params.flightListSlug;

        db.collection('viewFlightListsSummary')
            .find({
                'slug': flightListSlug
            }, {
                limit: 1,
                projection: {
                    _id : 1,
                    owner : {
                        $eq : [
                            '$owner._id',
                            req.user._id
                        ]
                    },
                    shared : {
                        $in : [
                            req.user._id,
                            '$shared._id'
                        ]
                    },
                    shareRequest : {
                        $in : [
                            req.user._id,
                            '$shareRequest._id'
                        ]
                    }
                }
            })
            .toArray()
            .then()
            .then(([flSettings] = []) => {
                if (flSettings) {
                    console.log(`[checkSlugAndPermissions] <${flSettings._id}> found`);
                    req.flightListPermissions = {
                        'read'          : flSettings.owner || flSettings.shared,
                        'owner'         : {
                            'read'          : flSettings.owner || flSettings.shared,
                            'change'        : flSettings.owner
                        },
                        'flights'       : {
                            'read'          : flSettings.owner || flSettings.shared,
                            'add'           : flSettings.owner || flSettings.shared,
                            'remove'        : flSettings.owner || flSettings.shared
                        },
                        'shared'         : {
                            'read'          : flSettings.owner || flSettings.shared,
                            'add'           : flSettings.owner,
                            'remove'        : flSettings.owner
                        },
                        'shareRequest'  : {
                            'read'          : flSettings.owner,
                            'add'           : !(flSettings.owner || flSettings.shared || flSettings.shareRequest),
                            'remove'        : flSettings.owner || flSettings.shareRequest
                        }
                    };
                    next();
                } else {
                    //FlightList Slug does not exist at all
                    res.sendStatus(404);
                }
            })
            .catch(next);
        })
        .catch(next);
}

function resFlightList(req, res) {
    res.send(req.flightList);
}


router.use(`/:flightListSlug(${SLUG_MATCHER_ROUTE_MATCHER})`, checkSlugAndPermissions, flightListSlugRouter);
router.get('/', getAllFlightLists, resAllFlightLists);
//TODO: Add validation against jsonSchema
router.post('/', newFlightList, resFlightList);

module.exports = router;