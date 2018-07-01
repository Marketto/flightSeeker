const express = require('express');
const router = express.Router({mergeParams: true});
const aviationEdge = require('../services/aviation-edge');
const airlineRouter = require('./airlineRouter');

/* GET users listing. */

function validateAirport(req, res, next) {
  if ((/^[A-Z]{3}$/i).test(req.params.codeIataAirport)) {
    next();
  } else {
    console.error("IATA Airport not valid");
    res.sendStatus(400);
  }
}

function validateAirports(req, res, next) {
  if ((/^[A-Z]{3}$/i).test(req.params.iataDeparture) && (/^[A-Z]{3}$/i).test(req.params.iataArrival)) {
    if (req.params.iataDeparture.toUpperCase() !== req.params.iataArrival.toUpperCase()) {
      next();
    } else {
      console.error("IATA Departure and Destination Airports can't be the same");
      res.sendStatus(400);
    }
  } else {
    console.error("IATA Airport not valid");
    res.sendStatus(400);
  }
}

function reqAirport (req, res, next) {
  aviationEdge.service({
    'resource': 'airportDatabase',
    'static': true
  }).then((data = []) => {
    res.airportData = data;

    next();
  }, err => {
    console.error(err);
    res.sendStatus(500);
  });
}

function reqRoutes(req, res, next) {
  if (res.airportDeparture && res.airportArrival) {
    aviationEdge.service({
      'resource': 'routes',
      'params'  : {
        'departureIata' : res.airportDeparture.codeIataAirport,
        'arrivalIata'   : res.airportArrival.codeIataAirport
      }
    }).then((data = []) => {
      res.routesData = data;
      
      delete res.airportDeparture;
      delete res.airportArrival;

      next();
    }, err => {
      console.error(err);
      res.sendStatus(500);
    });
  }
}

function getAirportByIata(airportList, iata) {
  const iataAirportMatcher = new RegExp(`^${iata.trim()}$`, 'i');
  return airportList.find((airport = {}) => {
    return iataAirportMatcher ? iataAirportMatcher.test(airport.codeIataAirport) : true;
  });
}

function airportByIata(req, res, next) {
  if ((/^[a-z]{3}$/i).test(req.params.iataAirport)) {
    const iataAirport = req.params.iataAirport.toUpperCase();
    const airport = getAirportByIata(res.airportData, iataAirport);
    if (airport) {
      res.airportData = [airport];
      next();
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(400);
  }
}

function airportsByIata(req, res, next) {
  if (req.params.iataDeparture && req.params.iataArrival) {
    res.airportDeparture = getAirportByIata(res.airportData, req.params.iataDeparture);
    res.airportArrival = getAirportByIata(res.airportData, req.params.iataArrival);
    delete res.airportData;
  }

  next();
}

function airportStartsWith(req, res, next) {
  const startsWithMatcher = req.query.startsWith && new RegExp(`^${req.query.startsWith}`, 'i');
  res.airportData = (res.airportData || []).filter((airport = {}) => {
    return startsWithMatcher ? startsWithMatcher.test(airport.nameAirport) : true;
  });
  
  next();
}

function resAirport(req, res) {
  if (res.airportData.length > 0) {
    res.send(res.airportData);
  } else {
    res.sendStatus(204);
  }
}

router.get('/', reqAirport, airportStartsWith, resAirport);
router.get('/:iataAirport', validateAirport, reqAirport, airportByIata, resAirport);

router.use('/:iataAirport/airline', validateAirport, reqAirport, airportByIata, airlineRouter);
router.use('/:iataDeparture/to/:iataArrival/airline', 
  validateAirports,
  reqAirport, 
  airportsByIata,
  reqRoutes,
  airlineRouter
);

module.exports = router;
