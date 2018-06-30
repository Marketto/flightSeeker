const express = require('express');
const router = express.Router();
const aviationEdge = require('../services/aviation-edge');

/* GET users listing. */
router.get('/', function(req, res, next) {
    aviationEdge.service({
      'resource'  : 'airportDatabase',
      'static'    : true
    }).then((data=[]) => {
      if(data){
        const startsWith = req.query.startsWith;
        if (startsWith) {
          const startsWithMatcher = new RegExp(`^${startsWith}`, 'i');
          res.send(data.filter((airport = {}) => {
            return startsWithMatcher.test(airport.nameAirport);
          }));
        } else {
          res.send(data);
        }
      } else {
        res.sendStatus(204);
      }
    }, err => {
      console.error(err);
      res.sendStatus(500);
    });
});

module.exports = router;
