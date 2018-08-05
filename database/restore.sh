#!/bin/bash
mongodump --db flightSeeker --collection users
mongodump --db flightSeeker --collection flightLists
cp -rf ./flightSeeker/*.* ./dump/flightSeeker
mongo flightSeeker --eval "db.dropDatabase()"
mongorestore --dir dump
