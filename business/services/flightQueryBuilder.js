const moment = require('moment-timezone');

function flightAggregation(findQuery, limit = 0) {
    const aggCfg = [
        {
            $match: findQuery
        },
        {
            $lookup: {
                from: "flights",
                localField: 'flights',
                foreignField: 'uuid',
                as: 'flights'
            }
        },
        {
            $unwind: "$flights"
        },

        {
            $lookup: {
                from: "airports",
                localField: 'flights.departure.airportIata',
                foreignField: 'iata',
                as: 'flights.departure.airport'
            }
        },
        {
            $unwind: "$flights.departure.airport"
        },

        {
            $lookup: {
                from: "airports",
                localField: 'flights.arrival.airportIata',
                foreignField: 'iata',
                as: 'flights.arrival.airport'
            }
        },
        {
            $unwind: "$flights.arrival.airport"
        },

        {
            $lookup: {
                from: "airlines",
                localField: 'flights.airlineIata',
                foreignField: 'iata',
                as: 'flights.airline'
            }
        },
        {
            $unwind: "$flights.airline"
        },

        {
            $lookup: {
                from: "users",
                localField: 'owner',
                foreignField: '_id',
                as: 'owner'
            }
        },
        {
            $unwind: "$owner"
        },

        {
            $lookup: {
                from: "users",
                localField: 'shared',
                foreignField: '_id',
                as: 'shared'
            }
        },
        {
            $unwind: {
                path: "$shared",
                preserveNullAndEmptyArrays: true
            }
        },
        
        {
            $lookup: {
                from: "users",
                localField: 'shareRequest',
                foreignField: '_id',
                as: 'shareRequest'
            }
        },
        {
            $unwind: {
                path: "$shareRequest",
                preserveNullAndEmptyArrays: true
            }
        },


        {
            $project: {
                owner : {
                    _id:1,
                    name:1
                },
                shared : {
                    _id:1,
                    name:1
                },
                shareRequest : {
                    _id:1,
                    name:1
                },
                flights : {
                    departure: {
                        airport: {
                            name: 1,
                            city: 1,
                            country: 1,
                            iata: 1,
                            countryCode: 1,
                            cityIata: 1,
                            position: 1,
                            timeZone: 1
                        },
                        terminal: "$flights.departure.airportTerminal",
                        dateTime: 1,
                        delay: 1,
                        offset: 1
                    },
                    arrival: {
                        airport: {
                            name: 1,
                            city: 1,
                            country: 1,
                            iata: 1,
                            countryCode: 1,
                            cityIata: 1,
                            position: 1,
                            timeZone: 1
                        },
                        terminal: "$arrival.airportTerminal",
                        dateTime: 1,
                        delay: 1,
                        offset: 1
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
        },
        {
            $sort : {
                "flights.departure.dateTime" : -1
            }
        },
        {
            $group: {
                _id: "$_id",
                owner : {
                    $first : "$owner"
                },
                shared : {
                    $addToSet : "$shared"
                },
                shareRequest : {
                    $addToSet : "$shareRequest"
                },
                flights : {
                    $push : "$flights"
                }
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

/*
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
*/


module.exports = {
    flightAggregation
    //,enrichFlight
};