const { URL, URLSearchParams } = require('url');
const config = require('../config.json');
const keys = require('../keys.json');
const cachios = require('cachios');

const longTermCacheAge = 36 * 60 * 60;
const standardCacheAge = 15 * 60;

function getServiceUrl (path = '', params = {}) {
    let aviationEdgeUrl = new URL(path, config.aviationEdgeUri);

    //Params
    let aviationEdgeParams = new URLSearchParams(aviationEdgeUrl.search);

    aviationEdgeParams.set('key', keys.aviationEdgeKey);
    
    Object.keys(params).forEach(p => {
        this.searchParams.set(p, this.params[p]);
    }, {
        'searchParams': aviationEdgeParams,
        'params': params
    });

    aviationEdgeUrl.search = aviationEdgeParams;

    //return
    return aviationEdgeUrl;
}

module.exports = {
    'service': async (cfg = {}) => {
        const serviceUri = getServiceUrl(cfg.resource, cfg.params).href;
        
        const response = await cachios.get(serviceUri, {
                'ttl' : cfg.static ? longTermCacheAge : standardCacheAge
            });

        if (response.status < 300 && !response.data.error) {
            return response.data;
        } else if (( /no\s*record\s*found/i).test(((response.data||{}).error||{}).text)){
            return null;
        } else {
            throw ((response.data||{}).error||{}).text;
        }
    },
    'url' : getServiceUrl
};