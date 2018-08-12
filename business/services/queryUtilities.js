function cleanProjection(conf = {}){
    const projectionConfg = {};
    
    for (let k in conf) {
        if (conf.hasOwnProperty(k) && conf[k]) {
            projectionConfg[k] = conf[k];
        }
    }

    return projectionConfg;
}


module.exports = {
    cleanProjection
};