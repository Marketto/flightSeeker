const express = require('express');
const router = express.Router({mergeParams: true});
const mongo = require('../services/mongo');
const flightRouter = require('./flightRouter');

function reqAirline(req, res, next) {
  mongo().then(db => {
    const startsWithRegExp = req.query.startsWith ? {
      '$regex': new RegExp(`^${req.query.startsWith}`, 'i')
    } : null;

    const countryCode = ((res.airportData || [])[0] || {}).countryCode;

    const airlineQuery = (req.params.iataAirline || res.routesData) ? {
      'iata': req.params.iataAirline || {
        '$in': res.routesData.map(route => route.iata)
      },
    } : null;
    const startsWithQuery = req.query.startsWith ? {
      'name': startsWithRegExp
    } : null;
    const airPortQuery = countryCode ? {
      'countryCode' : countryCode
    } : null;

    const queryConditions = [
      {
        'iata' : /^[A-Z\d]{2}$/
      },
      airlineQuery, 
      startsWithQuery, 
      airPortQuery
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
  if (res.airlineData.length > 0) {
    res.send(res.airlineData);
  } else {
    res.sendStatus(204);
  }
}

/* GET users listing. */
router.get('/', reqAirline, resAirline);
router.get('/:iataAirline([A-Z\d]{2})', reqAirline, resAirline);
router.use('/:iataAirline([A-Z\d]{2})/flight', flightRouter);

module.exports = router;
