const express = require('express');
const router = express.Router({mergeParams: true});
const mongo = require('../services/mongo');
const flightRouter = require('./flightRouter');
const escapeStringRegexp = require('escape-string-regexp');

function reqAirline(req, res, next) {
  mongo().then(db => {

    const airlineQuery = (req.params.iataAirline || res.routesData) ? {
      'iata': req.params.iataAirline || {
        '$in': res.routesData.map(route => route.iata)
      },
    } : null;

    const startsWith = req.query.startsWith;

    const startsWithQuery = req.query.startsWith ? {
      '$or' : [
        {
          'name': {
            '$regex': new RegExp(`^${escapeStringRegexp(startsWith)}`, 'i')
          }
        },
        {
          'iata': {
            '$regex': new RegExp(`^${escapeStringRegexp(startsWith)}`, 'i')
          }
        }
      ]
    } : null;

    const queryConditions = [
      {
        'iata' : /^[A-Z\d]{2}$/
      },
      airlineQuery, 
      startsWithQuery
    ].filter(c=>!!c);
    
    const query = queryConditions.length > 1 ? {
      '$and': queryConditions
    } : queryConditions[0];

    console.log(query);
    db.collection("airlines").find(query).toArray().then(result => {
      res.airlineData = result || [];
      next();
    }, err => {
      console.error(err);
      res.sendStatus(500);
    });
  }, err => {
    console.error(err);
    res.sendStatus(500);
  });
}

function resAirline(req, res) {
  if (res.airlineData.length > 0) {
    res.send(res.airlineData);
  } else {
    res.sendStatus(204);
  }
}

/* GET users listing. */
router.get('/', reqAirline, resAirline);
router.get('/:iataAirline([A-Z0-9]{2})', reqAirline, resAirline);
router.use('/:iataAirline([A-Z0-9]{2})/flight', flightRouter);

module.exports = router;
