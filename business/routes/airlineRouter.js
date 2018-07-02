const express = require('express');
const router = express.Router({mergeParams: true});
const flightRouter = require('./flightRouter');

function reqAirline(req, res, next) {
  mongo().then(db => {
    const startsWithRegExp = req.query.startsWith ? {
      '$regex': new RegExp(`^${req.query.startsWith}`, 'i')
    } : null;
    const query = (req.params.iataAirport || res.routesData) ? {
      iata: req.params.iataAirline || {
        '$in': res.routesData.map(route=>route.iata)
      },
    } : (
      req.query.startsWith ? {
        '$or': [{
            'name': startsWithRegExp
          }
        ]
      } : {}
    );

    db.collection("airlines").find(query).toArray().then(result => {
      res.airlineData = result || [];
      console.log(result);
      next();
    }, err => {
      console.error(err);
      res.sendStatus(500);
    });
  }, err => {
    console.error(err);
    res.sendStatus(500);
  });
}

function airlineByCountry(req, res, next){
  if((res.airportData||[]).length){
    const countryMatcher = new RegExp(`^${res.airportData[0].countryCode}$`, 'i');
    res.airlineData = (res.airlineData || []).filter((airline = {}) => {
      return countryMatcher ? countryMatcher.test(airline.codeIso2Country) : true;
    });
  }

  next();
}

function resAirline(req, res) {
  if (res.airlineData.length > 0) {
    res.send(res.airlineData);
  } else {
    res.sendStatus(204);
  }
}

/* GET users listing. */
router.get('/', reqAirline, resAirline);
router.get('/:iataAirline([A-Z]{2})', reqAirline, resAirline);
router.use('/:iataAirline([A-Z]{2})/flight', flightRouter);

module.exports = router;
