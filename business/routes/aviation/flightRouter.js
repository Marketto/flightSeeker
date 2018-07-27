const express = require('express');
const router = express.Router({ mergeParams: true });
const { URLSearchParams } = require('url');
const flightLookup = require('../../connectors/flight-lookup');
const mongo = require('../../connectors/mongo');
const moment = require('moment-timezone');
const {
    flightAggregation,
    enrichFlight
} = require('../../services/flightQueryBuilder');

const {
    DATE_ROUTE_MATCHER,
    FLIGHT_UUID_ROUTE_MATCHER,
    FLIGHT_UUID_REGEXP,
    FLIGHT_NUM_ROUTE_MATCHER,
    TIME_REGEXP,
    NEGATIVE_BOOL_REGEXP
} = require('../routingConst');

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

function logErr(err) {
    console.error(err);
    res.sendStatus(500);
}

function reqFlight(req, res, next) {
    console.log("[reqFlight]");
    if (
        req.params.iataDeparture &&
        req.params.iataArrival &&
        req.params.date
    ) {
        //Params check
        req.params.flightNumber = isNaN(req.params.flightNumber) ? undefined : parseInt(req.params.flightNumber);
        req.query.limit = isNaN(req.query.limit) ? 0 : parseInt(req.query.limit);
        req.query.at = TIME_REGEXP.test(req.query.at) ? req.query.at : null;
        req.query.after = TIME_REGEXP.test(req.query.after) ? req.query.after : null;
        req.query.aggregate = !(req.query.aggregate === false || NEGATIVE_BOOL_REGEXP.test(req.query.aggregate));
        
        next();
    } else {
        res.sendStatus(400);
    }
}


function dbFlights(req, res, next) {
    if (!req.dbDataChecked && !req.remoteNoResults) {
        console.log("[dbFlights]");

        mongo().then(db => {
            const from = req.params.iataDeparture;
            const to = req.params.iataArrival;
            const airline = req.params.iataAirline;
            
            const flightNumber = req.params.flightNumber;

            const atTime = req.query.at;
            const afterTime = req.query.after;
            const dateTime = moment(new Date((afterTime || atTime) ? `${req.params.date}T${afterTime || atTime}` : req.params.date));

            const aggregate = req.query.aggregate;
            const queryLimit = (atTime || (flightNumber && airline)) ? 1 : req.query.limit;

            const checkQuery = {
                "departure.airportIata": from,
                "arrival.airportIata": to,
                "departure.dateTime": {
                    "$gte": moment(dateTime).startOf("day").toDate(),
                    "$lte": moment(dateTime).endOf("day").toDate()
                }
            };

            const findQuery = Object.assign({
                "departure.airportIata": from,
                "arrival.airportIata": to,
                "departure.dateTime": atTime ? {
                    "$lte": moment(dateTime).endOf("hour").toDate(),
                    "$gte": moment(dateTime).startOf("hour").toDate()
                } : {
                    "$gte": (afterTime ? dateTime : moment(dateTime).startOf("day")).toDate(),
                    "$lte": moment(dateTime).endOf("day").toDate()
                }
            }, airline ? {
                "airlineIata": airline
            } : {}, flightNumber ? {
                "number": flightNumber
            } : {}, );


            const flightsCollection = db.collection('flights');
            
            Promise.all([
                req.dbDataChecked || flightsCollection.find(checkQuery).count(),

                (aggregate ?
                    flightsCollection.aggregate(flightAggregation(findQuery, queryLimit)).map(enrichFlight):
                    flightsCollection.find(findQuery).limit(queryLimit)
                ).sort({
                    "departure.dateTime": 1
                }).toArray()

            ]).then(([dataCheck, flights = []]) => {
                console.log(`[dataCheck > ${dataCheck ? 'Found' : 'No'} results for ${from} to ${to} @ ${dateTime}]`);
                req.dbDataChecked = dataCheck > 0;
                req.flights = flights;

                next();
            }, logErr);
        }, logErr);
    } else {
        next();
    }
}

function nullIfEmptyString(str){
    return (str||"").trim() || null;
}

function flFlights(req, res, next) {
    if (!req.dbDataChecked) {
        console.log("[flFlights]");

        const from = req.params.iataDeparture;
        const to = req.params.iataArrival;
        const date = new moment(req.params.date);

        Promise.all([
            flightLookup.service({
                'resource': `TimeTable/${from}/${to}/${date.format('YYYYMMDD')}`
            }),
            mongo()
        ]).then(([journeys, db]) => {
            try {
                const flights = [];
                ([].concat((journeys||{}).FlightDetails))
                    .filter(e=>!!e)
                    .forEach(journey => {
                        if (journey) {
                            ([].concat(fixXmlObject(journey).flightLegDetails)).forEach((flight = {}) => {
                                if (flight && !flights.some(f => f.uuid === flight.uuid)) {

                                    const departureAirport = flight.departureAirport || {};
                                    const departure = {
                                        airportIata : departureAirport.locationCode,
                                        airportTerminal : nullIfEmptyString(departureAirport.terminal),
                                        dateTime: moment(flight.departureDateTime).toDate()
                                    };
                                    
                                    const arrivalAirport = flight.arrivalAirport || {};
                                    const arrival = {
                                        airportIata : arrivalAirport.locationCode,
                                        airportTerminal : nullIfEmptyString(arrivalAirport.terminal),
                                        dateTime : moment(flight.arrivalDateTime).toDate()
                                    };
                                    
                                    const airlineIata = (flight.marketingAirline||{}).code;

                                    flights.push({
                                        departure,
                                        arrival,
                                        airlineIata,
                                        'number': parseInt(flight.flightNumber),
                                        'meals': flight.meals,
                                        'uuid': flight.uuid
                                    });
                                }
                            });
                        }
                    });
                req.dataChecked = true;
                if (flights.length) {
                    //store results into db
                    db.collection('flights').insertMany(flights, {
                        ordered: false
                    }).then(() => {
                        console.log("[storedFlights]");
                        next();
                    }, err => console.error(err));
                } else {
                    req.remoteNoResults = true;
                    next();
                }
                
            } catch (err) {
                logErr(err);
            }
        }, logErr);
    } else {
        next();
    }
}

function flightUUIDParse(req, res, next) {
    console.log("[flightUUIDParse]");
    const parsedUUID = FLIGHT_UUID_REGEXP.exec(req.params.flightUUID)
    Object.assign(req.params, {
        iataDeparture: parsedUUID[1],
        iataArrival: parsedUUID[2],
        date: moment(parsedUUID[3],['YYYYMMDD', 'YYYY-MM-DD']).format("YYYY-MM-DD"),
        iataAirline: parsedUUID[4],
        flightNumber: parsedUUID[5]
    });
    next();
}

function resFlights(req, res, next) {
    if ((req.flights||[]).length > 0) {
        res.status(200).send(req.flights);
    } else if (req.params.uuid) {
        res.sendStatus(404);
    } else if (req.query.after) {
        //Params
        const nextDayUrlSearch = new URLSearchParams();
        if (req.query.limit) {
            nextDayUrlSearch.set('limit', req.query.limit);
        }

        const nextDayUrl = `${moment(req.params.date).add(1, 'day').format('YYYY-MM-DD')}?${nextDayUrlSearch.toString()}`;

        res.redirect(nextDayUrl);
    } else {
        res.sendStatus(204);
    }
}

router.get(`/:date(${DATE_ROUTE_MATCHER})`, reqFlight, dbFlights, flFlights, dbFlights, resFlights);
router.get(`/:date(${DATE_ROUTE_MATCHER})/:flightNumber(${FLIGHT_NUM_ROUTE_MATCHER})`, reqFlight, dbFlights, flFlights, dbFlights, resFlights);
router.get(`/:flightUUID(${FLIGHT_UUID_ROUTE_MATCHER})`, flightUUIDParse, reqFlight, dbFlights, flFlights, dbFlights, resFlights);
router.put(`/:flightUUID(${FLIGHT_UUID_ROUTE_MATCHER})`, flightUUIDParse, reqFlight, dbFlights, flFlights, dbFlights);

module.exports = router;
