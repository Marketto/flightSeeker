const { URL, URLSearchParams } = require('url');
const config = require('../config.json');
const keys = require('../keys.json');
const genericService = require('./generic-service');

function getServiceUrl (cfg = {}) {
    let aviationEdgeUrl = new URL(cfg.resource, config.aviationEdgeUri);

    //Params
    let aviationEdgeParams = new URLSearchParams(aviationEdgeUrl.search);

    aviationEdgeParams.set('key', keys.aviationEdgeKey);
    
    Object.keys(cfg.params||{}).forEach(p => {
        aviationEdgeParams.set(p, cfg.params[p]);
    });

    aviationEdgeUrl.search = aviationEdgeParams;

    //return
    return aviationEdgeUrl;
}

module.exports = {
    'service': async cfg => {
        const data = await genericService(getServiceUrl(cfg))(Object.assign({static:true}, cfg));

        if (!(data || {}).error) {
            return data;
        } else if ((/no\s*record\s*found/i).test(((data || {}).error || {}).text)) {
            return null;
        } else {
            throw ((data || {}).error || {}).text;
        }
    },
    'url' : getServiceUrl
};