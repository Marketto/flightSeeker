const express = require('express');
const router = express.Router();

const airportRouter = require('./airportRouter');
const airlineRouter = require('./airlineRouter');
const flightRouter = require('./flightRouter');
const routeRouter = require('./routeRouter');

const {
  AIRPORT_ROUTE_MATCHER,
  AIRLINE_ROUTE_MATCHER
} = require('../routingConst');


const DEPARTURE_PATH = `airport/:iataDeparture(${AIRPORT_ROUTE_MATCHER})`;
const ARRIVAL_PATH = `to/:iataArrival(${AIRPORT_ROUTE_MATCHER})`;
const FROM_TO_PATH = `${DEPARTURE_PATH}/${ARRIVAL_PATH}`;
const AIRLINE_PATH = `airline/:iataAirline(${AIRLINE_ROUTE_MATCHER})`;

router.use('/airport', airportRouter);
router.use(`/${DEPARTURE_PATH}/${AIRLINE_PATH}/to`, routeRouter, airportRouter);
router.use(`/${DEPARTURE_PATH}/airline`, routeRouter, airlineRouter);
router.use(`/${FROM_TO_PATH}/flight`, routeRouter, flightRouter);
router.use(`/${FROM_TO_PATH}/${AIRLINE_PATH}/flight`, routeRouter, flightRouter);
router.use(`/${FROM_TO_PATH}/airline`, routeRouter, airlineRouter);
router.use(`/${DEPARTURE_PATH}/to`, routeRouter, airportRouter);
router.use(`/${AIRLINE_PATH}/airport`, routeRouter, airportRouter);
router.use('/airline', airlineRouter);
router.use('/flight', flightRouter);

module.exports = router;
