const { URL, URLSearchParams } = require('url');
const config = require('../config.json');
const keys = require('../keys.json');
const genericService = require('./generic-service');


function getServiceUrl(cfg = {}) {
    let flightLookupUrl = new URL(cfg.resource, config.flightLookupUri);

    //Params
    let flightLookupParams = new URLSearchParams(flightLookupUrl.search);

    flightLookupParams.set('key', keys.flightLookupKey);
    
    cfg.params = cfg.params||{};

    Object.keys(cfg.params).filter(p => !!cfg.params[p]).forEach(p => {
        flightLookupParams.set(p, cfg.params[p]);
    });

    flightLookupUrl.search = flightLookupParams;

    //return
    return flightLookupUrl;
}

module.exports = {
    'service': async cfg => {
        const srcData = await genericService(getServiceUrl(cfg))(Object.assign({type: 'xml'}, cfg));
        const data = srcData ? srcData[Object.keys(srcData)[0]] : {};

        if ((/No\s.+\sfound/i).test((data.FLSWarning || {}).FLSWarningName || "")) {
            return null;
        } else if ((data.Errors || {}).Error || data.FLSWarning) {
            throw ((data.Errors || {}).Error||{}).FLSErrorName || data.FLSWarning.FLSWarningName;
        } else {
            return data;
        }
    },
    'url': getServiceUrl
};