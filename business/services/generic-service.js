const cachios = require('cachios');
const xml2json = require('xml2json');

const longTermCacheAge = 36 * 60 * 60;
const standardCacheAge = 15 * 60;

module.exports = (serviceUrl) => async (cfg = {}) => {
    
    const response = await cachios.get(serviceUrl.href, {
            'ttl' : cfg.static ? longTermCacheAge : standardCacheAge,
            'responseType' : cfg.type || 'json'
        });

    if (response.status < 300) {
        return (/^xml$/i).test(cfg.type) ? JSON.parse(xml2json.toJson(response.data)) : response.data;
    } else {
        throw new Error("Remote Service error");
    }
};