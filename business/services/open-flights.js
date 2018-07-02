const { URL } = require('url');
const config = require('../config.json');
const genericService = require('./generic-service');

function getServiceUrl(cfg = {}) {
    const openFlightsUrl = new URL(`${cfg.resource}.dat`, config.openFlights.uri);
    //return
    return openFlightsUrl;
}

module.exports = {
    'service': async cfg => {
        const data = await genericService(getServiceUrl(cfg))(Object.assign({
            'type'        : 'csv',
            'csvHeader'   : config.openFlights[cfg.resource],
            'static'      : true
        }, cfg));
        
        return data;
    },
    'url': getServiceUrl
};