const express = require('express');
const router = express.Router({ mergeParams: true });
const flightLookup = require('../services/flight-lookup');
const openFlights = require('../services/open-flights');
const moment = require('moment-timezone');

function fixXmlObject(obj){
    const fixedObj = {};
    Object.keys(obj).forEach(objKey => {
        const value = obj[objKey];
        let fixedKey = objKey.replace(/^FLS/, '');
        fixedKey = (/^[A-Z\d]+$/).test(objKey) ? fixedKey.toLowerCase() : (fixedKey[0].toLowerCase() + fixedKey.substr(1));
        
        if (Array.isArray(value)) {
            fixedObj[fixedKey] = value.map(fixXmlObject);
        } else if (typeof value === 'object') {
            fixedObj[fixedKey] = fixXmlObject(value);
        } else {
            fixedObj[fixedKey] = value;
        }
    });
    return fixedObj;
}

function validateFlightNumber(req, res, next) {
    if ((/^\d{4}$/).test(req.params.flightNumber)) {
        next();
    } else {
        console.error("Flight number not valid");
        res.sendStatus(400);
    }
}

function reqFlight(req, res, next) {
    if (req.params.iataDeparture && req.params.iataArrival && req.params.date) {
        const from = req.params.iataDeparture;
        const to = req.params.iataArrival;
        const date = new moment(req.params.date);

        Promise.all([
            flightLookup.service({
                'resource': `TimeTable/${from}/${to}/${date.format('YYYYMMDD')}`,
                'params' : {
                    'Airline'   : req.params.iataAirline,
                    'Connection': req.query.stopOver ? 'AUTO' : 'DIRECT'
                }
            }),
            openFlights.service({
                'resource': "airports"
            })
        ]).then(responses => {
            function calculateDTvalues(flight={}){
                try {
                    const departureIataCode = flight.departureCode || (flight.departureAirport || {}).locationCode;
                    const arrivalIataCode = flight.arrivalCode || (flight.arrivalAirport || {}).locationCode;

                    const departureTimeZone = (responses[1].find(airport => airport.iata === departureIataCode) || {}).tz;
                    const arrivalTimeZone = (responses[1].find(airport => airport.iata === arrivalIataCode) || {}).tz;
                    
                    const departureDateTime = moment.tz(flight.departureDateTime, departureTimeZone);
                    const arrivalDateTime = moment.tz(flight.arrivalDateTime, arrivalTimeZone);

                    const departureTimeOffset = departureDateTime.format('Z');
                    const arrivalTimeOffset = arrivalDateTime.format('Z');

                    const flightDuration = moment.duration(arrivalDateTime.diff(departureDateTime));

                    return {
                        departureTimeZone,
                        arrivalTimeZone,
                        departureTimeOffset,
                        arrivalTimeOffset,
                        [flight.totalTripTime ? "totalTripTime" : "journeyDuration"]: flightDuration
                    };
                } catch (err) {
                    console.error(err);
                    res.sendStatus(500);
                }
            }

            try {
                res.flightData = (responses[0].FlightDetails || []).map(fixXmlObject).map(flight => {
                    return Object.assign(
                        flight,
                        calculateDTvalues(flight),
                        {
                            "flightLegDetails": ([].concat(flight.flightLegDetails)).map((fd = {}) => Object.assign(fd, calculateDTvalues(fd)))
                        });
                });

                next();
            } catch(err){
                console.error(err);
                res.sendStatus(500);
            }
        }, err => {
            console.error(err);
            res.sendStatus((/Missing/i).test(err) ? 400 : 500);
        });
    } else {
        res.sendStatus(400);
    }
}

function flightByNumber(req, res, next){
    if (req.params.flightNumber){
        res.flightData = [res.flightData.find(route => route.flightLegDetails
            .some(flight => flight.flightNumber === req.params.flightNumber)
        )].filter(e => !!e);
    }
    next();
}

function resFlight(req, res) {
    if (res.flightData.length > 0) {
        res.send(res.flightData);
    } else {
        res.sendStatus(204);
    }
}

function flightUUIDParse(req, res, next) {
    const parsedUUID = (/^([a-z]{3})([a-z]{3})(\d{8})([a-z]{2})(\d{4})$/i).exec(req.params.flightUUID)
    Object.assign(req.params, {
        iataDeparture   : parsedUUID[1],
        iataArrival     : parsedUUID[2],
        iataAirline     : parsedUUID[4],
        date            : parsedUUID[3],
        flightNumber    : parsedUUID[5]
    });
    next();
}

function flightByTime(req, res, next){
    if ((/^\d{2}:\d{2}$/).test(req.query.at)) {
        res.flightData = [res.flightData.find(route => moment(route.departureDateTime).isSame(`${req.params.date}T${req.query.at}`, 'hour'))].filter(e => !!e);
    } else if ((/^\d{2}:\d{2}$/).test(req.query.after)) {
        res.flightData = res.flightData.filter(route => moment(route.departureDateTime).isSameOrAfter(`${req.params.date}T${req.query.after}`, 'hour')).filter(e => !!e);
    }
    next();
}

function flightLimit(req, res, next) {
    if ((/^\d{1,}$/).test(req.query.limit) && parseInt(req.query.limit)>0) {
        const limit = parseInt(req.query.limit);
        res.flightData = res.flightData.slice(0, limit);
    }
    next();
}

/* GET users listing. */
router.get('/:date(\\d{4}-?\\d{2}-?\\d{2})', reqFlight, flightByTime, flightLimit, resFlight);
router.get('/:date(\\d{4}-?\\d{2}-?\\d{2})/:flightNumber(\\d{4})', reqFlight, flightByNumber, flightLimit, resFlight);
router.get('/:flightUUID([A-Za-z]{6}\\d{8}[A-Za-z]{2}\\d{4})', flightUUIDParse, reqFlight, flightByNumber, flightLimit, resFlight);
module.exports = router;
