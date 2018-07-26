const moment = require('moment-timezone');

function flightAggregation(findQuery, limit = 0) {
    const aggCfg = [{
            $match: findQuery
        },
        {
            $lookup: {
                from: "airports",
                localField: 'departure.airportIata',
                foreignField: 'iata',
                as: 'departureAirport'
            }
        },
        {
            $unwind: "$departureAirport"
        },

        {
            $lookup: {
                from: "airports",
                localField: 'arrival.airportIata',
                foreignField: 'iata',
                as: 'arrivalAirport'
            }
        },
        {
            $unwind: "$arrivalAirport"
        },

        {
            $lookup: {
                from: "airlines",
                localField: 'airlineIata',
                foreignField: 'iata',
                as: 'airline'
            }
        },
        {
            $unwind: "$airline"
        },

        {
            $project: {
                departure: {
                    airport: {
                        name: "$departureAirport.name",
                        city: "$departureAirport.city",
                        country: "$departureAirport.country",
                        iata: "$departureAirport.iata",
                        countryCode: "$departureAirport.countryCode",
                        cityIata: "$departureAirport.cityIata",
                        position: "$departureAirport.position",
                        timeZone: "$departureAirport.timeZone"
                    },
                    terminal: "$departure.airportTerminal",
                    dateTime: "$departure.dateTime"
                },
                arrival: {
                    airport: {
                        name: "$arrivalAirport.name",
                        city: "$arrivalAirport.city",
                        country: "$arrivalAirport.country",
                        iata: "$arrivalAirport.iata",
                        countryCode: "$arrivalAirport.countryCode",
                        cityIata: "$arrivalAirport.cityIata",
                        position: "$arrivalAirport.position",
                        timeZone: "$arrivalAirport.timeZone"
                    },
                    terminal: "$arrival.airportTerminal",
                    dateTime: "$arrival.dateTime"
                },
                airline: {
                    iata: 1,
                    name: 1,
                    countryCode: 1,
                    callSign: 1
                },
                meals: 1,
                number: 1,
                uuid: 1
            }
        }
    ];
    if (limit > 0) {
        aggCfg.push({
            $limit: limit
        });
    }
    return aggCfg;
}


function enrichFlight(flight) {
    const departureDtz = moment.tz(moment(flight.departure.dateTime).format("YYYY-MM-DDTHH:mm:ss"), flight.departure.airport.timeZone);
    const arrivalDtz = moment.tz(moment(flight.arrival.dateTime).format("YYYY-MM-DDTHH:mm:ss"), flight.arrival.airport.timeZone);

    return Object.assign(flight, {
        departure: Object.assign(flight.departure, {
            'dateTime': departureDtz.format()
        }),
        arrival: Object.assign(flight.arrival, {
            'dateTime': arrivalDtz.format()
        }),
        'duration': moment.duration(arrivalDtz.diff(departureDtz))
    });
}



module.exports = {
    flightAggregation,
    enrichFlight
};