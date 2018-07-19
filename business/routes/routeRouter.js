const express = require('express');
const router = express.Router({ mergeParams: true });
//const aviationEdge = require('../services/aviation-edge');
const mongo = require('../services/mongo');
//const airlineRouter = require('./airlineRouter');
//const flightRouter = require('./flightRouter');

function reqRoutes(req, res, next) {
    console.log('[reqRoutes]');
    mongo().then(db => {
        const airportList = [
            req.params.iataDeparture,
            req.params.iataArrival
        ].filter(airport => !!airport);
        const airline = req.params.iataAirline;

        const criteria = [
            airline && {
                'airline': airline
            },
            airportList.length && {
                'airports': {
                    $all: airportList
                }
            }
        ].filter(c => !!c);
        const query = criteria.length>1 ? {
            $and: criteria
        }: criteria[0];

        db.collection("routes").find(query).toArray().then(result => {
            const fromLog = req.params.iataDeparture && ` from ${req.params.iataDeparture}`;
            const toLog = req.params.iataArrival && ` to ${req.params.iataArrival}`;
            const fromToLog = fromLog && !toLog ? ` from/to ${req.params.iataDeparture}` : (fromLog + toLog);
            const byLog = req.params.iataAirline ? ` by ${req.params.iataAirline}` : '';

            console.log(`Routes${fromToLog}${byLog}`);
            
            if (result.length) {
                res.routesData = result.map(route=>({
                    iataAirline: route.airline,
                    iataAirports: route.airports
                }));
                next();
            } else {
                res.sendStatus(204);
            }
        }, err => {
            console.error(err);
            res.sendStatus(500);
        });
    }, err => {
        console.error(err);
        res.sendStatus(500);
    });

    /*aviationEdge.service({
        'resource': 'routes',
        'params': {
            'departureIata': req.params.iataDeparture,
            'arrivalIata': req.params.iataArrival
        }
    }).then((data = []) => {
        res.routesData = (data||[]).filter((route, idx, routes)=>{
            return idx === routes.findIndex(r2 => r2.airlineIata === route.airlineIata && r2.airlineIcao === route.airlineIcao)
        }).map(route=>{
            return {
                icao: route.airlineIcao,
                iata: route.airlineIata
            };
        });
        
        console.log(`Routes for ${req.params.iataDeparture} to ${req.params.iataArrival}`);

        next();
    }, err => {
        console.error(err);
        res.sendStatus(500);
    });*/
}

router.use('/', reqRoutes); //, airlineRouter);
/*
router.get('/:iataAirline([A-Z0-9]{2})', reqRoutes, airlineRouter);
router.use('/:iataAirline([A-Z0-9]{2})/flight', flightRouter);
*/
module.exports = router;
