const ROUTING_CONST = {
    AIRLINE_ROUTE_MATCHER       : "[A-Z\\d]{2}",
    AIRPORT_ROUTE_MATCHER       : "[A-Z\\d]{3}",
    DATE_ROUTE_MATCHER          : "\\d{4}-?\\d{2}-?\\d{2}",
    TIME_ROUTE_MATCHER          : "\\d{2}:\\d{2}",
    FLIGHT_NUM_ROUTE_MATCHER    : "\\d+",
    SLUG_MATCHER_ROUTE_MATCHER  : "[A-Za-z\\d]+[A-Za-z\\d-]+[A-Za-z\\d]+",
    OBJECT_ID_ROUTE_MATCHER     : "[a-f\\d]{24}"
};

const UUID_CFG = [
    ROUTING_CONST.AIRPORT_ROUTE_MATCHER,
    ROUTING_CONST.AIRPORT_ROUTE_MATCHER,
    ROUTING_CONST.DATE_ROUTE_MATCHER,
    ROUTING_CONST.AIRLINE_ROUTE_MATCHER,
    ROUTING_CONST.FLIGHT_NUM_ROUTE_MATCHER
];

Object.assign(ROUTING_CONST, {
    FLIGHT_UUID_ROUTE_MATCHER   : UUID_CFG.join(''),

    AIRLINE_REGEXP        : new RegExp(`^${ROUTING_CONST.AIRLINE_ROUTE_MATCHER}$`),
    AIRPORT_REGEXP        : new RegExp(`^${ROUTING_CONST.AIRPORT_ROUTE_MATCHER}$`),
    DATE_REGEXP           : new RegExp(`^${ROUTING_CONST.DATE_ROUTE_MATCHER}$`),
    TIME_REGEXP           : new RegExp(`^${ROUTING_CONST.TIME_ROUTE_MATCHER}$`),
    FLIGHT_NUM_REGEXP     : new RegExp(`^${ROUTING_CONST.FLIGHT_NUM_ROUTE_MATCHER}$`),
    SLUG_REGEXP           : new RegExp(`^${ROUTING_CONST.SLUG_MATCHER_ROUTE_MATCHER}$`),
    OBJECT_ID_REGEXP      : new RegExp(`^${ROUTING_CONST.OBJECT_ID_ROUTE_MATCHER}$`),
    FLIGHT_UUID_REGEXP    : new RegExp(`^${UUID_CFG.map(m => `(${m})`).join('')}$`),

    POSITIVE_BOOL_REGEXP  : /^(?:true|1|y)$/i,
    NEGATIVE_BOOL_REGEXP  : /^(?:false|0|n)$/i
});


module.exports = Object.freeze(ROUTING_CONST);