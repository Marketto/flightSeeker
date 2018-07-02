const express = require('express');
const router = express.Router({mergeParams: true});
const aviationEdge = require('../services/aviation-edge');
const openFlights = require('../services/open-flights');
const routeRouter = require('./routeRouter');
const flightRouter = require('./flightRouter');

/* GET users listing. */

/*function validateAirport(req, res, next) {
  if ((/^[A-Z]{3}$/i).test(req.params.iataAirport)) {
    console.log(`Validation for ${req.params.iataAirport}`);
    next();
  } else {
    console.error(`IATA Airport not valid <${req.params.iataAirport}>`);
    res.sendStatus(400);
  }
}*/

/*function validateAirports(req, res, next) {
  if ((/^[A-Z]{3}$/i).test(req.params.iataDeparture) && (/^[A-Z]{3}$/i).test(req.params.iataArrival)) {
    if (req.params.iataDeparture.toUpperCase() !== req.params.iataArrival.toUpperCase()) {
      console.log(`Validation for ${req.params.iataDeparture} to ${req.params.iataArrival}`);
      next();
    } else {
      console.error("IATA Departure and Destination Airports can't be the same");
      res.sendStatus(400);
    }
  } else {
    console.error("IATA Airport not valid");
    res.sendStatus(400);
  }
}*/

function reqAirport (req, res, next) {
  Promise.all([
    aviationEdge.service({
      'resource': 'airportDatabase'
    }),
    openFlights.service({
      'resource': 'airports'
    })
  ]).then(responses => {
      res.airportData = responses[0].map(aeAirport => {
        const additionalDetails = responses[1].find(ofAirport => ofAirport.iata === aeAirport.codeIataAirport) || {};

        return Object.assign(additionalDetails, {
          'name'        : aeAirport.nameAirport,
          'countryCode' : aeAirport.codeIso2Country,
          'cityIata'    : aeAirport.codeIataCity,
          'type'        : undefined,
          'source'      : undefined,
          'airportId'   : undefined
        });
      });
      console.log(`Retrieved Airport and additional informations`);
      next();
  }, err => {
    console.error(err);
    res.sendStatus(500);
  });
}

function getAirportByIata(airportList = [], iata = "") {
  const iataAirportMatcher = new RegExp(`^${iata.trim()}$`, 'i');
  return airportList.find((airport = {}) => {
    return iataAirportMatcher ? iataAirportMatcher.test(airport.iata) : true;
  });
}

function airportByIata(req, res, next) {
  const iataAirport = req.params.iataAirport.toUpperCase();
  const airport = getAirportByIata(res.airportData, iataAirport);
  if (airport) {
    res.airportData = [airport];
    console.log(`Airport ${req.params.iataAirport}`);
    next();
  } else {
    console.error(`Couldn't find Airport for IATA ${req.params.iataAirport}`);
    res.sendStatus(404);
  }
}

function airportsByIata(req, res, next) {
  res.airportDeparture = getAirportByIata(res.airportData, req.params.iataDeparture);
  res.airportArrival = getAirportByIata(res.airportData, req.params.iataArrival);
  delete res.airportData;
  if (res.airportDeparture && res.airportArrival) {
    console.log(`Airport ${res.airportDeparture.iata} to ${res.airportArrival.iata}`);
    next();
  } else if (!res.airportDeparture) {
    console.error(`Departure Airport Not Found: ${req.params.iataDeparture}`);
    res.sendStatus(404);
  } else {
    console.error(`Arrival Airport Not Found: ${req.params.iataArrival}`);
    res.sendStatus(404);
  }
}

function airportStartsWith(req, res, next) {
  if(req.query.startsWith){
    const startsWithMatcher = req.query.startsWith && new RegExp(`^${req.query.startsWith}`, 'i');
    res.airportData = (res.airportData || []).filter((airport = {}) => {
      return startsWithMatcher ? (startsWithMatcher.test(airport.name) || startsWithMatcher.test(airport.city)) : true;
    });
    console.log(`Airports filtered by name or city starting with ${req.query.startsWith}`);
  }
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
router.get('/:iataAirport([A-Z]{3})', reqAirport, airportByIata, resAirport);

router.use('/:iataDeparture([A-Z]{3})/to/:iataArrival([A-Z]{3})/flight', flightRouter);
router.use('/:iataDeparture([A-Z]{3})/to/:iataArrival([A-Z]{3})/airline', routeRouter);

module.exports = router;
