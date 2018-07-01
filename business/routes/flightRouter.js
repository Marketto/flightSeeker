const express = require('express');
const router = express.Router({ mergeParams: true });
const lightLookup = require('../services/flight-lookup');
const moment = require('moment');

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

        lightLookup.service({
            'resource': `TimeTable/${from}/${to}/${date.format('YYYYMMDD')}`,
            'params' : {
                'Airline'   : req.params.iataAirline,
                'Connection': req.query.stopOver ? 'AUTO' : 'DIRECT'
            }
        }).then((data = {}) => {
            res.flightData = (data.FlightDetails || []).map(fixXmlObject);
            next();
        }, err => {
            console.error(err="");
            res.sendStatus((/Missing/i).test(err) ? 400 : 500);
        });
    } else {
        res.sendStatus(400);
    }
}

function flightByNumber(req, res, next){
    if (req.params.flightNumber){
        res.flightData = [res.flightData.find(f => f.flightLegDetails.flightNumber === req.params.flightNumber)].filter(e => !!e);
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

/* GET users listing. */
router.get('/', reqFlight, resFlight);
router.get('/:flightNumber', validateFlightNumber, reqFlight, flightByNumber, resFlight);

module.exports = router;
