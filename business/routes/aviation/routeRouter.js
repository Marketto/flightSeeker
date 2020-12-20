const express = require('express');
const router = express.Router({ mergeParams: true });
const mongo = require('../../connectors/mongo');

function reqRoutes(req, res, next) {
    console.log('[reqRoutes]');
    mongo().then(db => {
        const {
            iataDeparture,
            iataArrival,
            iataAirline,
        } = req.params;
        const airline = req.params.iataAirline;

        const criteria = [
            iataAirline && {
                'airlineIata': iataAirline
            },
            iataDeparture && {
                'departureAirportIata': iataDeparture
            },
            iataArrival && {
                'arrivalAirportIata': iataArrival
            },
        ].filter(c => !!c);
        const query = criteria.length > 1 ? {
            $and: criteria
        } : criteria[0];

        db.collection("viewFlightRoutes").find(query).toArray()
        .then(result => {
            const fromLog = iataDeparture && ` from ${iataDeparture}`;
            const toLog = iataArrival && ` to ${iataArrival}`;
            const fromToLog = fromLog && !toLog ? ` from/to ${iataDeparture}` : (fromLog + toLog);
            const byLog = iataAirline ? ` by ${iataAirline}` : '';

            console.log(`Routes${fromToLog}${byLog}`);
            
            if (result.length) {
                res.routesData = result;
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
