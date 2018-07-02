const express = require('express');
const router = express.Router({mergeParams: true});

const mongo = require('../services/mongo');
const routeRouter = require('./routeRouter');
const flightRouter = require('./flightRouter');

function reqAirport(req, res, next){
  mongo().then(db => {
    const startsWithRegExp = req.query.startsWith ? {
        '$regex': new RegExp(`^${req.query.startsWith}`, 'i')
      } : null;
    const query = req.params.iataAirport ? {
      iata : req.params.iataAirport,
    } : (
      req.query.startsWith ? {
        '$or' : [
          {
            'name': startsWithRegExp
          },
          {
            'city': startsWithRegExp
          }
        ]
      } : {}
    );
    
    db.collection("airports").find(query).toArray().then(result => {
      res.airportData = result||[];
      console.log(result);
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

function getAirportByIata(airportList = [], iata = "") {
  const iataAirportMatcher = new RegExp(`^${iata.trim()}$`, 'i');
  return airportList.find((airport = {}) => {
    return iataAirportMatcher ? iataAirportMatcher.test(airport.iata) : true;
  });
}

function resAirport(req, res) {
  if (res.airportData.length > 0) {
    res.send(res.airportData);
  } else {
    res.sendStatus(204);
  }
}

router.get('/', reqAirport, resAirport);
router.get('/:iataAirport([A-Z]{3})', reqAirport, resAirport);

router.use('/:iataDeparture([A-Z]{3})/to/:iataArrival([A-Z]{3})/flight', flightRouter);
router.use('/:iataDeparture([A-Z]{3})/to/:iataArrival([A-Z]{3})/airline', routeRouter);

module.exports = router;
