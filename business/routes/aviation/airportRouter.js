const express = require('express');
const router = express.Router({mergeParams: true});
const mongo = require('../../connectors/mongo');
const escapeStringRegexp = require('escape-string-regexp');

const {
  AIRPORT_ROUTE_MATCHER
} = require('../routingConst');

function reqAirport(req, res, next) {
  console.log('[reqAirport]');
  mongo().then(db => {
    const startsWith = (req.query.startsWith || "").trim() || null;
    const notInCity = (req.query.notInCity || "").trim() || null;
    const iataAirport = (req.params.iataAirport || "").trim() || null;

    const reachableAirports = res.routesData && [[]].concat(res.routesData.map(r=>r.iataAirports))
      .reduce((a, b)=>a.concat(b))
      .filter((iata, idx, airports) => iata !== req.params.iataDeparture && airports.indexOf(iata)===idx).sort();

    const query = iataAirport ? {
      'iata' : iataAirport
    } : (
      {
        '$and' : [
          startsWith && {
            '$text' : {
              '$search': startsWith
            }
          }, notInCity  && {
            'cityIata': {
              '$ne': notInCity
            }
          }, reachableAirports && {
            'iata' : {
              '$in': reachableAirports
            }
          }
        ].filter(c=>!!c)
      }
    );

    const airportsCursor = db.collection("airports").find(query);
    airportsCursor.project({_id: 0, cityNames: 0});
    airportsCursor.toArray().then(result => {
      res.airportData = result || [];
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

const spellCheckerRegexpGenerator = text => {
  const fillMatcher = "\\w";
  const matchers = text.split('')
    .map((c, i, a) => `${a.slice(0, i).join('')}${fillMatcher}${a.slice(i + 1).join('')}`)
    .join('|');
  return new RegExp(`^(?:${matchers})`, 'ui');
};

function reqAirportSpellChecker(req, res, next) {
  console.log('[reqAirportSpellChecker]');
  const startsWith = (req.query.startsWith || "").trim() || null;
  if (res.airportData.length > 0 || (startsWith || "").length < 4) {
    next();
  }

  mongo().then(db => {
    const notInCity = (req.query.notInCity || "").trim() || null;
    const escapedStartsWith = escapeStringRegexp(startsWith);
    const matchingRegExp = spellCheckerRegexpGenerator(escapedStartsWith);

    const reachableAirports = res.routesData && [[]].concat(res.routesData.map(r=>r.iataAirports))
      .reduce((a, b)=>a.concat(b))
      .filter((iata, idx, airports) => iata !== req.params.iataDeparture && airports.indexOf(iata)===idx).sort();

    const query = {
      '$and' : [
        {
          '$or': [
            {
              'cityNames': matchingRegExp
            },
            {
              'city': matchingRegExp
            },
            {
              'name': matchingRegExp
            },
            {
              'country': matchingRegExp
            }
          ]
        }, notInCity  && {
          'cityIata': {
            '$ne': notInCity
          }
        }, reachableAirports && {
          'iata' : {
            '$in': reachableAirports
          }
        }
      ].filter(c=>!!c)
    };

    const airportsCursor = db.collection("airports").find(query);
    airportsCursor.project({_id: 0, cityNames: 0});
    airportsCursor.toArray().then(result => {
      res.airportData = result || [];
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

function resAirport(req, res) {
  console.log('[resAirline]');
  if (res.airportData.length > 0) {
    res.send(res.airportData);
  } else {
    res.sendStatus(204);
  }
}

router.get('/', reqAirport, reqAirportSpellChecker, resAirport);
router.get(`/:iataAirport(${AIRPORT_ROUTE_MATCHER})`, reqAirport, resAirport);

module.exports = router;
