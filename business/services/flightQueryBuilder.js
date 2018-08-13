function airportPipeline(path) {
    return [{
            $lookup: {
                from: "airports",
                localField: `${path}.airportIata`,
                foreignField: 'iata',
                as: `${path}.airport`
            }
        },
        {
            $unwind: `$${path}.airport`
        }
    ];
}

function airlinePipeline(path) {
    return [{
            $lookup: {
                from: "airlines",
                localField: `${path ? (path + '.') : ''}airlineIata`,
                foreignField: 'iata',
                as: `${path ? (path + '.') : ''}airline`
            }
        },
        {
            $unwind: `$${path ? (path + '.') : ''}airline`
        }
    ];
}

function userPipeline(path) {
    return [{
            $lookup: {
                from: "users",
                localField: path,
                foreignField: '_id',
                as: path
            }
        },
        {
            $unwind: {
                path: `$${path}`,
                preserveNullAndEmptyArrays: true
            }
        }
    ];
}

function flightProjectionPipeline(path, container = {}) {
    const projection = {
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
            terminal: `$${path ? (path + '.') : ''}departure.airportTerminal`,
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
            terminal: `$${path ? (path + '.') : ''}arrival.airportTerminal`,
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
    };

    if (path) {
        container[path] = projection;
    } else {
        container = projection;
    }

    return [{
            $project: container
        },
        {
            $sort: {
                [`${path ? (path + '.') : ''}departure.dateTime`]: -1
            }
        }
    ];
}

function flightAggregation(findQuery, limit = 0) {
    const aggCfg = [{
            $match: findQuery
        }]
        .concat(airportPipeline('departure'))
        .concat(airportPipeline('arrival'))
        .concat(airlinePipeline())
        .concat(flightProjectionPipeline());

    if (limit > 0) {
        aggCfg.splice(1, 0, {
            $limit: limit
        });
    }
    return aggCfg;
}

function flightListFlighAggregation(findQuery, limit = 0) {
    const aggCfg = [{
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
            }
        ]
        .concat(airportPipeline('flights.departure'))
        .concat(airportPipeline('flights.arrival'))
        .concat(airlinePipeline('flights'))
        .concat(userPipeline('owner'))
        .concat(userPipeline('shared'))
        .concat(userPipeline('shareRequest'))
        .concat(flightProjectionPipeline('flights', {
            name: 1,
            slug: 1,
            owner: {
                _id: 1,
                name: 1
            },
            shared: {
                _id: 1,
                name: 1
            },
            shareRequest: {
                _id: 1,
                name: 1
            }
        }))
        .concat({
            $group: {
                _id: "$_id",
                name: {
                    $first: "$name"
                },
                slug: {
                    $first: "$slug"
                },
                owner: {
                    $first: "$owner"
                },
                shared: {
                    $addToSet: "$shared"
                },
                shareRequest: {
                    $addToSet: "$shareRequest"
                },
                flights: {
                    $push: "$flights"
                }
            }
        });

    if (limit > 0) {
        aggCfg.splice(1, 0, {
            $limit: limit
        });
    }
    return aggCfg;
}


module.exports = {
    flightAggregation,
    flightListFlighAggregation
};