#!/bin/bash
echo "[0/3] Starting DB backup process"

echo "[1/3] Performing dump/backup of existing collections";
mongodump --db flightSeeker --out ./

echo "[2/3] Deleting user-related and 3rd party data"
rm ./flightSeeker/flightLists.bson
rm ./flightSeeker/flights.bson
rm ./flightSeeker/users.bson

echo "[3/3] Backup DB complete"
