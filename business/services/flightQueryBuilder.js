function pathBuilder(path) {
    return (path || '').trim() ? `path.` : '';
}

function airportPipeline(srcPath) {
    const path = pathBuilder(srcPath);
    return [
        {
            $lookup: {
                from: "airports",
                localField: `${path}airportIata`,
                foreignField: 'iata',
                as: `${path}airport`
            }
        },
        {
            $unwind: {
                "path": `$${path}airport`,
                "preserveNullAndEmptyArrays": true
            }
        }
    ];
}

function airlinePipeline(srcPath) {
    const path = pathBuilder(srcPath);
    return [
        {
            $lookup: {
                from: "airlines",
                localField: `${path}airlineIata`,
                foreignField: 'iata',
                as: `${path}airline`
            }
        },
        {
            $unwind: {
                "path": `$${path}airline`,
                "preserveNullAndEmptyArrays": true
            }
        }
    ];
}

function userPipeline(path) {
    return [
        {
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

function flightProjectionPipeline(srcPath, container = {}) {
    const path = pathBuilder(srcPath);
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
            terminal: `$${path}departure.airportTerminal`,
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
            terminal: `$${path}arrival.airportTerminal`,
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
        container[srcPath] = projection;
    } else {
        container = projection;
    }

    return [
        {
            $project: container
        },
        {
            $sort: {
                [`${path}departure.dateTime`]: -1
            }
        }
    ];
}

function flightAggregation(findQuery, limit = 0, sort = {"departure.dateTime":1}) {
    const aggCfg = [
        {
            $match: findQuery
        }
    ]
    .concat(airportPipeline('departure'))
    .concat(airportPipeline('arrival'))
    .concat(airlinePipeline())
    .concat(flightProjectionPipeline())
    .concat({
        "$sort": sort
    });

    if (limit > 0) {
        aggCfg.push({
            "$limit": limit
        });
    }

    return aggCfg;
}

function flightListFlighAggregation(findQuery, limit = 0) {
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
            $unwind: {
                path: "$flights",
                preserveNullAndEmptyArrays: true
            }
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
    .concat([
        {
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
                    $push: {
                        $cond: {
                            if: "$flights.uuid",
                            then: "$flights",
                            else: null
                        }
                    }
                }
            }
        },
        {
            $project: {
                name:1,
                slug:1,
                owner:1,
                shared:1,
                shareRequest:1,
                flights: {
                    $filter: {
                        input: '$flights',
                        as: 'flight',
                        cond: {$ne:['$$flight', null] }
                    }
                }
            }
        }
    ]);

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