const express = require('express');
const router = express.Router({mergeParams: true});
const aviationEdge = require('../services/aviation-edge');
const flightRouter = require('./flightRouter');


/*function validateAirline(req, res, next) {
  if ((/^[A-Z]{2}$/i).test(req.params.iataAirline)) {
    next();
  } else {
    console.error("IATA Airline not valid");
    res.sendStatus(400);
  }
}*/

function reqAirline(req, res, next) {
  aviationEdge.service({
    'resource': 'airlineDatabase'
  }).then((data = []) => {
    res.airlineData = data;

    next();
  }, err => {
    console.error(err);
    res.sendStatus(500);
  });
}

function airlineByIata(req, res, next) {
  const iataAirlineMatcher = req.params.iataAirline && new RegExp(`^${req.params.iataAirline.trim()}$`, 'i');
  res.airlineData = [res.airlineData.find((airline = {}) => {
    return iataAirlineMatcher ? iataAirlineMatcher.test(airline.codeIataAirline) : true;
  })].filter(e => !!e);

  next();
}

function airlineByRoute(req, res, next) {
  if (res.routesData) {
    const routesAirlineIata = res.routesData
      .map(r => r.airlineIata)
      .filter((r, idx, routes) => routes.indexOf(r) == idx);
    
    res.airlineData = (res.airlineData||[]).filter((airline = {}) => {
      return routesAirlineIata.includes(airline.codeIataAirline);
    }).filter(e => !!e);

    delete res.routesData;
  }
  next();
}

function airlineByCountry(req, res, next){
  if((res.airportData||[]).length){
    const countryMatcher = new RegExp(`^${res.airportData[0].countryCode}$`, 'i');
    res.airlineData = (res.airlineData || []).filter((airline = {}) => {
      return countryMatcher ? countryMatcher.test(airline.codeIso2Country) : true;
    });
  }

  next();
}

function airlineStartsWith(req, res, next) {
  const startsWithMatcher = req.query.startsWith && new RegExp(`^${req.query.startsWith}`, 'i');
  res.airlineData = (res.airlineData || []).filter((airline = {}) => {
    const startsWithFilter = startsWithMatcher ? startsWithMatcher.test(airline.nameAirline) : true;

    return startsWithFilter;
  });

  next();
}

function resAirline(req, res) {
  if (res.airlineData.length > 0) {
    res.send(res.airlineData);
  } else {
    res.sendStatus(204);
  }
}

/* GET users listing. */
router.get('/', reqAirline, airlineByRoute, airlineByCountry, airlineStartsWith, resAirline);
router.get('/:iataAirline([A-Z]{2})', reqAirline, airlineByRoute, airlineByIata, resAirline);
router.use('/:iataAirline([A-Z]{2})/flight', flightRouter);

module.exports = router;
