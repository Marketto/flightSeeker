const express = require('express');
const router = express.Router({mergeParams: true});
const mongo = require('../../connectors/mongo');
const slug = require('slug');

function logErr(err) {
    console.error(err);
    res.sendStatus(500);
}

function getAllFlightLists(req, res, next) {
    console.log("[getAllFlightLists]");
    mongo().then(db => {
        db.collection('flightLists').find({
            '$or': [{
                    'owner': req.user._id
                },
                {
                    'shared': req.user._id
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
        const newFligthList = {
            'name': req.body.name,
            'slug': req.body.slug || slug(req.body.name),
            'owner': req.user._id,
            'shared': [],
            'flights': req.body.flights || []
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

function resFlightList(req, res) {
    res.send(req.flightList);
}

router.get('/', getAllFlightLists, resAllFlightLists);
//TODO: Add validation against jsonSchema
router.post('/', newFlightList, resFlightList);

module.exports = router;