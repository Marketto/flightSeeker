#!/bin/bash
echo "[0/4] Starting DB backup process"

echo "[1/4] Performing dump/backup of existing collections";
mongodump --db flightSeeker --out ./

echo "[2/4] Deleting user-related and 3rd party data"
rm ./flightSeeker/flightLists.bson
rm ./flightSeeker/flights.bson
rm ./flightSeeker/users.bson

echo "[3/4] Prettyfing metadata"
node prettify-metadata.js

echo "[4/4] Backup DB complete"
