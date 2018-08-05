#!/bin/bash
mkdir dump >/dev/null
mongodump --db flightSeeker --collection users >/dev/null
mongodump --db flightSeeker --collection flightLists >/dev/null
cp -rf ./flightSeeker/*.* ./dump/flightSeeker
mongo flightSeeker --eval "db.dropDatabase()"
mongorestore --dir ./dump
