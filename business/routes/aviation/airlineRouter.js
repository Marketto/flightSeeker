const express = require('express');
const router = express.Router({mergeParams: true});
const mongo = require('../../connectors/mongo');
const escapeStringRegexp = require('escape-string-regexp');
const {
  AIRLINE_ROUTE_MATCHER, 
  AIRLINE_REGEXP
} = require('../routingConst');

function reqAirline(req, res, next) {
  console.log('[reqAirline]');
  
  const {
    iataAirline,
  } = req.params;
  
  const {
    startsWith,
  } = req.query;

  mongo().then(db => {
    const airlineQuery = (iataAirline || res.routesData) ? {
      'iata': iataAirline || {
        '$in': res.routesData
          .map(({ airlineIata }) => airlineIata)
          .filter((airline, index, airlines) => airlines.indexOf(airline) === index)
      },
    } : null;

    const startsWithQuery = startsWith ? {
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
        'iata' : AIRLINE_REGEXP
      },
      airlineQuery, 
      startsWithQuery
    ].filter(c=>!!c);
    
    const query = queryConditions.length > 1 ? {
      '$and': queryConditions
    } : queryConditions[0];

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
  console.log('[resAirline]');
  if (res.airlineData.length > 0) {
    res.send(res.airlineData);
  } else {
    res.sendStatus(204);
  }
}

/* GET users listing. */
router.get('/', reqAirline, resAirline);
router.get(`/:iataAirline(${AIRLINE_ROUTE_MATCHER})`, reqAirline, resAirline);

module.exports = router;
