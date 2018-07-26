const MongoClient = require('mongodb').MongoClient;
const config = require('../config.json');

module.exports = async ()=>{
    const client = await MongoClient.connect(config.mongodb, {
        useNewUrlParser: true
    });
    return client.db();
};
