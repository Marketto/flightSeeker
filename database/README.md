# FlightSeeker Mongo Database

Database for Flight Seeker

## Requirements
* MongoDb 3.6

## Install

Run `mongo restore`.

## Backup

Run `mongo backup`.

## Data sources

### Airports

Airports information are a mix of airports and cities dataset from openflights.org

### Airlines

Airlines data comes from wikipedia.com and IATA official website information with additional data about country added manually (query)

### Routes

Routes data come from openflights.org filtered by used Airports, without duplicate routes (only one way routes)
