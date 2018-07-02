const cachios = require('cachios');
const xml2json = require('xml2json');
const config = require('../config.json');

const longTermCacheAge = config.cache.staticResourceTimeout;
const standardCacheAge = config.cache.dynamicResourceTimeout;


module.exports = (serviceUrl) => async (cfg = {}) => {
    
    const response = await cachios.get(serviceUrl.href, {
            'ttl' : cfg.static ? longTermCacheAge : standardCacheAge,
            'responseType' : (cfg.type === 'csv' && 'text') || cfg.type || 'json'
        });

    if (response.status < 300) {
        if ((/^xml$/i).test(cfg.type)) {
        //XML
            return JSON.parse(xml2json.toJson(response.data));
        } else if ((/^csv$/i).test(cfg.type)) {
        // CSV / text
            const CSV_REGEXP = /([.\-+\d]+)|[^\\]\"((?:[^"]+(?:\\\")?)*[^\\])\"|(\\N)/g;
            return response.data.split("\n").filter(str=>!!(str||"").trim()).map(strData=>{
                return strData.match(CSV_REGEXP).map((val, idx)=>{
                    const parsedVal = isNaN(val) ? (((/^\,?\"(.+)\"$/).exec(val)||[])[1] || null) : parseFloat(val);
                    return {
                        [cfg.csvHeader[idx]]: parsedVal
                    };
                }).reduce((a,b)=>Object.assign(a,b));
            })
        }

        return response.data;
    } else {
        throw new Error("Remote Service error");
    }
};