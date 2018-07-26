const express = require('express');
const router = express.Router({ mergeParams: true });
const mongo = require('../../connectors/mongo');

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
}

router.use('/', reqRoutes);

module.exports = router;
