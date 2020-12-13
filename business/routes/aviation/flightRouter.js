/* eslint-disable prefer-reflect */
/* eslint-disable no-console */
const express = require('express');
const router = express.Router({ mergeParams: true });
const { URLSearchParams } = require('url');
const flightLookup = require('../../connectors/flight-lookup');
const mongo = require('../../connectors/mongo');
const moment = require('moment-timezone');

const {
    DATE_ROUTE_MATCHER,
    FLIGHT_UUID_ROUTE_MATCHER,
    FLIGHT_UUID_REGEXP,
    FLIGHT_NUM_ROUTE_MATCHER,
    TIME_REGEXP,
    NEGATIVE_BOOL_REGEXP
} = require('../routingConst');

const FL_FLIGHT_PROMISE_QUEUE = {};

function fixXmlObject(obj) {
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

function logErr(res) {
    return err => {
        console.error(err);
        res.sendStatus(500);
    };
}

function reqFlight(req, res, next) {
    console.log("[reqFlight]");
    if (
        req.params.iataDeparture &&
        req.params.iataArrival &&
        req.params.date
    ) {
        // Params check
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
            try {
                const from = req.params.iataDeparture;
                const to = req.params.iataArrival;
                const airline = req.params.iataAirline;

                const {flightNumber} = req.params;

                const {aggregate} = req.query;

                const checkQuery = {
                    "uuid": new RegExp(`^${from}${to}${moment(req.params.date).format("YYYYMMDD")}`, 'i')
                };
                let queryLimit = req.query.limit;
                let dateTime = moment.tz(req.params.date, req.departureAirport.timeZone);
                const findQuery = req.params.flightUUID ? {
                    "uuid": req.params.flightUUID
                } : {
                    "departure.airportIata": from,
                    "arrival.airportIata": to
                };
                if (!req.params.flightUUID) {
                    const atTime = req.query.at;
                    const afterTime = req.query.after;
                    if (afterTime || atTime) {
                        dateTime = moment.tz(`${req.params.date}T${afterTime || atTime}`, req.departureAirport.timeZone);
                    }
                    if (atTime || (flightNumber && airline)) {
                        queryLimit = 1;
                    }
                    if (airline) {
                        findQuery.airlineIata = airline;
                    }
                    if (flightNumber) {
                        findQuery.number = flightNumber
                    }
                    if (atTime) {
                        findQuery["departure.dateTime"] = {
                            "$gte": moment(dateTime).startOf("hour").toDate(),
                            "$lte": moment(dateTime).endOf("hour").toDate()
                        };
                    } else {
                        findQuery["departure.dateTime"] = {
                            "$gte": (afterTime ? dateTime : moment(dateTime).startOf("day")).toDate()
                        };
                        if ((queryLimit||999) > 10) {
                            findQuery["departure.dateTime"].$lte = moment(dateTime).add(24, "hours").toDate();
                        }
                    }
                }
                console.log(`Flight DateTime: ${dateTime.toDate().toJSON()}`);

                console.log(`QUERY ${JSON.stringify(findQuery)}`);

                db.collection('viewFlights')
                    .find(findQuery)
                    .limit(queryLimit)
                    .toArray()
                    .then(flights => { 
                        req.dbDataChecked = flightsCollection.length > 0;
                        req.flights = flights;
                        console.log(`[dataCheck > ${req.dbDataChecked ? 'Found' : 'No'} results for ${from} to ${to} @ ${dateTime}]`);
                        next();
                    })
                    .catch(next);
            } catch(err){
                logErr(res)(err);
            }
        }, logErr(res));
    } else {
        console.log("{skipping dbFlights}");
        next();
    }
}

function nullIfEmptyString(str) {
    return (str || "").trim() || null;
}

function findAirportTzByIata(db, airportIata) {
    const airportsCursor =  db.collection('airports').findOne({
            'iata': airportIata
        });

    //airportsCursor.projection({ _id: 0, iata: 1, timeZone: 1 });

    return airportsCursor;
}

function checkDepartureAirport(req, res, next) {
    mongo().then(db => {
        try {
            findAirportTzByIata(db, req.params.iataDeparture).then( airport => {
                req.departureAirport = airport;
                next();
            }, logErr(res));
        } catch(err) {
            logErr(res)(err);
        }
    }, logErr(res))
}

function flFlights(req, res, next) {
    if (req.dbDataChecked) {
        console.log("{skipping flFlights}");
        next();
    } else {
        console.log("[flFlights]");

        const from = req.params.iataDeparture;
        const to = req.params.iataArrival;
        const date = moment(req.params.date).format('YYYYMMDD');

        const flightSearchId = `${from}${to}${date}`;

        FL_FLIGHT_PROMISE_QUEUE[flightSearchId] = FL_FLIGHT_PROMISE_QUEUE[flightSearchId] || new Promise((flQueueResolve, flQueueReject) => {
            Promise.all([
                flightLookup.service({
                    'resource': `TimeTable/${from}/${to}/${date}`
                }),
                mongo()
            ]).then(([journeys, db]) => {

                const airports = {};

                if (req.departureAirport) {
                    airports[req.departureAirport.iata] = req.departureAirport;
                }

                function getAirportTz(airportIata) {
                    return new Promise(function(resolveAirport, rejectAirport) {
                        try {
                            if (airports[airportIata]) {
                                resolveAirport(airports[airportIata].timeZone);
                            } else {
                                findAirportTzByIata(db, airportIata)
                                    .then(airport => {
                                        airports[airportIata] = airport;
                                        resolveAirport(airport.timeZone);
                                    }, rejectAirport);
                            }
                        } catch (errAirport) {
                            rejectAirport(errAirport);
                        }
                    });
                }

                try {
                    console.log(`Promiser ${JSON.stringify([].concat((journeys || {}).FlightDetails)
                    .map(journey => journey && fixXmlObject(journey).flightLegDetails))}`);
                    Promise.all(([{}].concat((journeys || {}).FlightDetails))
                        .map(journey => journey && fixXmlObject(journey).flightLegDetails)
                        .reduce((a, b) => [].concat(a).concat(b))
                        .filter((flight, flightIdx, flightList) => {
                            return !!flight && !flightList.slice(0, flightIdx).some(({ uuid } = {}) => uuid === flight.uuid);
                        }).map(async flight => {
                            const departureAirport = flight.departureAirport || {};
                            const departureAirportIata = departureAirport.locationCode;
                            const departureTerminal = nullIfEmptyString(departureAirport.terminal);
                            const departureTimeZone = await getAirportTz(departureAirportIata);
                            const departureDtz = moment.tz(flight.departureDateTime, departureTimeZone);
                            const departure = {
                                airportIata: departureAirportIata,
                                dateTime: moment(departureDtz).utc().toDate(),
                                offset: departureDtz.utcOffset()
                            };
                            if (departureTerminal){
                                departure.airportTerminal = departureTerminal
                            }

                            const arrivalAirport = flight.arrivalAirport || {};
                            const arrivalTerminal = nullIfEmptyString(arrivalAirport.terminal);
                            const arrivalAirportIata = arrivalAirport.locationCode;
                            const arrivalTimeZone = await getAirportTz(arrivalAirportIata);
                            const arrivalDtz = moment.tz(flight.arrivalDateTime, arrivalTimeZone);
                            const arrival = {
                                airportIata: arrivalAirportIata,
                                dateTime: moment(arrivalDtz).utc().toDate(),
                                offset: arrivalDtz.utcOffset()
                            };
                            if (arrivalTerminal){
                                arrival.airportTerminal = arrivalTerminal
                            }

                            const airlineIata = (flight.marketingAirline || {}).code;

                            const meals = nullIfEmptyString(flight.meals);

                            const flightToInsert = {
                                departure,
                                arrival,
                                airlineIata,
                                'number': parseInt(flight.flightNumber),
                                'uuid': flight.uuid
                            };
                            if (meals) {
                                flightToInsert.meals = meals;
                            }

                            return flightToInsert;
                        }))
                    .then(flights => {
                            // const flights = flightList.reduce((a, b) => [].concat(a).concat(b)).filter(e => !!e);
                            req.dataChecked = true;
                            if (flights.length) {
                                // store results into db
                                Promise.all(flights.map(flight => {
                                    return new Promise(resolveInsert => {
                                        db.collection('flights').insertOne(flight)
                                            .then(resolveInsert, err => {
                                                // TODO: throw reject if error is not due to duplicate
                                                console.log(err);
                                                resolveInsert();
                                            });
                                    });
                                })).then(() => {
                                    console.log("[storedFlights]");
                                    flQueueResolve();
                                }, flQueueReject);

                            } else {
                                req.remoteNoResults = true;
                                flQueueResolve();
                            }
                        }, flQueueReject);
                } catch (err) {
                    flQueueReject(err);
                }
            }, flQueueReject);
        }, logErr(res));

        FL_FLIGHT_PROMISE_QUEUE[flightSearchId].then(() => {
            next();
            delete FL_FLIGHT_PROMISE_QUEUE[flightSearchId];
        }, err => {
            logErr(res)(err);
            delete FL_FLIGHT_PROMISE_QUEUE[flightSearchId];
        });
    }
}

function flightUUIDParse(req, res, next) {
    console.log("[flightUUIDParse]");
    const parsedUUID = FLIGHT_UUID_REGEXP.exec(req.params.flightUUID)
    Object.assign(req.params, {
        iataDeparture: parsedUUID[1],
        iataArrival: parsedUUID[2],
        date: moment(parsedUUID[3], ['YYYYMMDD', 'YYYY-MM-DD']).format("YYYY-MM-DD"),
        iataAirline: parsedUUID[4],
        flightNumber: parsedUUID[5]
    });
    next();
}

function resFlights(req, res) {
    if ((req.flights || []).length > 0) {
        console.log("[resFlights] <results found>");
        res.status(200).send(req.flights);
    } else if (req.params.uuid) {
        console.log("[resFlights] <uuid not found>");
        res.sendStatus(404);
    } else if (req.query.after) {
        console.log("[resFlights] <no results, redirect>");
        //Params
        const nextDayUrlSearch = new URLSearchParams();
        if (req.query.limit) {
            nextDayUrlSearch.set('limit', req.query.limit);
        }

        const nextDayUrl = `${moment(req.params.date).add(1, 'day').format('YYYY-MM-DD')}?${nextDayUrlSearch.toString()}`;

        res.redirect(nextDayUrl);
    } else {
        console.log("[resFlights] <no results>");
        res.sendStatus(204);
    }
}

router.get(`/:date(${DATE_ROUTE_MATCHER})`, reqFlight, checkDepartureAirport, dbFlights, flFlights, dbFlights, resFlights);
router.get(`/:date(${DATE_ROUTE_MATCHER})/:flightNumber(${FLIGHT_NUM_ROUTE_MATCHER})`, reqFlight, checkDepartureAirport, dbFlights, flFlights, dbFlights, resFlights);
router.get(`/:flightUUID(${FLIGHT_UUID_ROUTE_MATCHER})`, flightUUIDParse, reqFlight, checkDepartureAirport, dbFlights, flFlights, dbFlights, resFlights);
//router.put(`/:flightUUID(${FLIGHT_UUID_ROUTE_MATCHER})`, flightUUIDParse, reqFlight, dbFlights, flFlights, dbFlights);
router.retrieveFlightByUUID = [flightUUIDParse, reqFlight, checkDepartureAirport, dbFlights, flFlights, dbFlights];

module.exports = router;