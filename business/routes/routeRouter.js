const express = require('express');
const router = express.Router({ mergeParams: true });
const aviationEdge = require('../services/aviation-edge');
const airlineRouter = require('./airlineRouter');
const flightRouter = require('./flightRouter');

function reqRoutes(req, res, next) {
    aviationEdge.service({
        'resource': 'routes',
        'params': {
            'departureIata': req.params.iataDeparture,
            'arrivalIata': req.params.iataArrival
        }
    }).then((data = []) => {
        res.routesData = data.filter((route, idx, routes)=>{
            return idx === routes.findIndex(r2 => r2.airlineIata === route.airlineIata && route.airlineIcao === r2.airlineIcao)
        }).map(route=>{
            return {
                icao: route.airlineIcao,
                iata: route.airlineIata
            };
        });
        console.log(data);
        console.log(`Routes for ${req.params.iataDeparture} to ${req.params.iataArrival}`);

        next();
    }, err => {
        console.error(err);
        res.sendStatus(500);
    });
}

router.get('/', reqRoutes, airlineRouter);
router.use('/:iataAirline([A-Z]{2})/flight', flightRouter);

module.exports = router;
