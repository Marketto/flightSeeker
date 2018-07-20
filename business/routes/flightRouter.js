const express = require('express');
const router = express.Router({ mergeParams: true });
const { URLSearchParams } = require('url');
const flightLookup = require('../services/flight-lookup');
const mongo = require('../services/mongo');
const moment = require('moment-timezone');

const {
    DATE_ROUTE_MATCHER,
    FLIGHT_NUM_ROUTE_MATCHER,
    FLIGHT_UUID_ROUTE_MATCHER,
    FLIGHT_UUID_REGEXP,
    TIME_REGEXP
} = require('./routingConst');

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

function reqFlight(req, res, next) {
    if (
        req.params.iataDeparture && 
        req.params.iataArrival && 
        req.params.date
    ) {
    
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
            mongo()
        ]).then(responses => {
            const db = responses[1];

            const airportsDetail = {};

            async function enrichFlight(flight = {}) {
                return await new Promise((resolve, reject)=>{
                    const departureIataCode = flight.departureCode || (flight.departureAirport || {}).locationCode;
                    const arrivalIataCode = flight.arrivalCode || (flight.arrivalAirport || {}).locationCode;
                    
                    Promise.all([
                        airportsDetail[departureIataCode] || db.collection("airports").findOne({
                            'iata': departureIataCode
                        }),
                        airportsDetail[arrivalIataCode] || db.collection("airports").findOne({
                            'iata': arrivalIataCode
                        })
                    ]).then(result => {
                        try {
                            result.forEach(airport => {
                                airportsDetail[airport.iata] = airportsDetail[airport.iata] || Object.assign({}, airport);
                            });

                            const departureAirport = Object.assign(result[0]||{}, {
                                '_id':undefined,
                                'cityNames': undefined,
                                'terminal': (flight.departureAirport || {}).terminal
                            });
                            const arrivalAirport = Object.assign(result[1] || {}, {
                                '_id': undefined,
                                'cityNames': undefined,
                                'terminal': (flight.arrivalAirport || {}).terminal
                            });

                            const departureTimeZone = departureAirport.timeZone;
                            const arrivalTimeZone = arrivalAirport.timeZone;

                            const departureDateTime = moment.tz(flight.departureDateTime, departureTimeZone);
                            const arrivalDateTime = moment.tz(flight.arrivalDateTime, arrivalTimeZone);

                            const departureTimeOffset = departureDateTime.format('Z');
                            const arrivalTimeOffset = arrivalDateTime.format('Z');

                            const flightDuration = moment.duration(arrivalDateTime.diff(departureDateTime));

                            resolve(Object.assign({
                                departureTimeZone,
                                arrivalTimeZone,
                                departureTimeOffset,
                                arrivalTimeOffset,
                                [flight.totalTripTime ? "totalTripTime" : "journeyDuration"]: flightDuration
                            }, (flight.departureAirport && flight.arrivalAirport) ? {
                                departureAirport,
                                arrivalAirport
                            } : {
                                departureTimeZone,
                                arrivalTimeZone
                            }));
                        } catch (err) {
                            reject(err);
                        }
                    }, reject);
                });
            }

            
            const flightDetails = ([].concat((responses[0] || {}).FlightDetails)).filter(e=>!!e).map(fixXmlObject).filter(f => {
                return req.query.stopOver || !req.params.iataAirline || (![].concat(f.flightLegDetails).filter(fld=>!!fld).some(fld => fld.operatingAirline));
            });

            res.flightData = Promise.all(flightDetails.map(async function (flight) {
                try {
                    const enrichedFlight = await Object.assign(
                        flight,
                        await enrichFlight(flight),
                        {
                            "flightLegDetails": await Promise.all(([].concat(flight.flightLegDetails)).map(async function(fd = {}){
                                return await Object.assign(fd, await enrichFlight(fd))
                            }))
                        });

                    return Object.assign({
                        departureAirport: enrichedFlight.flightLegDetails[0].departureAirport,
                        arrivalAirport: enrichedFlight.flightLegDetails[enrichedFlight.flightLegDetails.length - 1].arrivalAirport
                    }, enrichedFlight);
                } catch (err) {
                    console.error(err);
                    res.sendStatus(500);
                }
            })).then(flightData=>{
                res.flightData = flightData;
                next();
            }, err=>{
                throw err;
            });
        }, err => {
            console.error(err);
            res.sendStatus((/Missing/i).test(err) ? 400 : 500);
        });
    } else {
        res.sendStatus(400);
    }
}

function flightByNumber(req, res, next) {
    console.log('[flightByNumber]');
    if (req.params.flightNumber) {
        res.flightData = [res.flightData.find(route => route.flightLegDetails
            .some(flight => flight.flightNumber === req.params.flightNumber)
        )].filter(e => !!e);
    }
    next();
}

function resFlight(req, res) {
    console.log('[resFlight]');
    if (res.flightData.length > 0) {
        res.send(res.flightData);
    } else {
        res.sendStatus(204);
    }
}

function flightUUIDParse(req, res, next) {
    const parsedUUID = FLIGHT_UUID_REGEXP.exec(req.params.flightUUID)
    Object.assign(req.params, {
        iataDeparture   : parsedUUID[1],
        iataArrival     : parsedUUID[2],
        date            : parsedUUID[3],
        iataAirline     : parsedUUID[4],
        flightNumber    : parsedUUID[5]
    });
    next();
}

function flightByTime(req, res, next){
    if (TIME_REGEXP.test(req.query.at)) {
        res.flightData = [res.flightData.find(route => Math.abs(moment(route.departureDateTime).diff(`${req.params.date}T${req.query.at}:00`, 'hour'))<2)].filter(e => !!e);
    } else if (TIME_REGEXP.test(req.query.after)) {
        res.flightData = res.flightData.filter(route => moment(route.departureDateTime).diff(`${req.params.date}T${req.query.after}`, 'minute')>=0).filter(e => !!e);
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

function nextDay(req, res, next) {
    if (!(res.flightData || []).length && TIME_REGEXP.test(req.query.after)) {
        //Params
        const nextDayUrlSearch = new URLSearchParams();
        if(req.query.limit){
            nextDayUrlSearch.set('limit', req.query.limit);
        }

        const nextDayUrl = `${moment(req.params.date).add(1, 'day').format('YYYY-MM-DD')}?${nextDayUrlSearch.toString()}`;

        res.redirect(nextDayUrl);
    } else {
        next();
    }
}

/* GET users listing. */
router.get(`/:date(${DATE_ROUTE_MATCHER})`, reqFlight, flightByTime, nextDay, flightLimit, resFlight);
router.get(`/:date(${DATE_ROUTE_MATCHER})/:flightNumber(${FLIGHT_NUM_ROUTE_MATCHER})`, reqFlight, flightByNumber, flightLimit, resFlight);
router.get(`/:flightUUID(${FLIGHT_UUID_ROUTE_MATCHER})`, flightUUIDParse, reqFlight, flightByNumber, flightLimit, resFlight);
module.exports = router;
