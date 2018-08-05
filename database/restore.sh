#!/bin/bash
mkdir dump/flightSeeker
mongodump --db flightSeeker --collection users &>/dev/null
mongodump --db flightSeeker --collection flightLists &>/dev/null
cp -rf ./flightSeeker/*.* ./dump/flightSeeker
mongo flightSeeker --eval "db.dropDatabase()" &>/dev/null
mongorestore --dir ./dump
