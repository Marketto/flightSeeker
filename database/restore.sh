#!/bin/bash
mkdir dump &>/dev/null
mkdir dump/flightSeeker &>/dev/null
mongodump --db flightSeeker --collection users &>/dev/null
mongodump --db flightSeeker --collection flightLists &>/dev/null
mongodump --db flightSeeker --collection flights &>/dev/null
cp -rf ./flightSeeker/*.* ./dump/flightSeeker
mongo flightSeeker --eval "db.dropDatabase()" --quiet &>/dev/null
mongorestore --dir ./dump
rm -rf ./dump
