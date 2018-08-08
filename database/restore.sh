#!/bin/bash
echo "[0/7] Starting DB restore/upgrade process"

echo "[1/7] Setting paths for existing db dump";
mkdir dump &>/dev/null
mkdir dump/flightSeeker &>/dev/null

echo "[2/7] Performing dump/backup of existing user-related and 3rd party information";
mongodump --db flightSeeker --collection users &>/dev/null
mongodump --db flightSeeker --collection flightLists &>/dev/null
mongodump --db flightSeeker --collection flights &>/dev/null

echo "[3/7] Copying data and metadata from repo over dumped"
cp -rf flightSeeker/*.* dump/flightSeeker

echo "[4/7] Dropping existing database"
mongo flightSeeker --eval "db.dropDatabase(); quit()" --quiet &>/dev/null

echo "[5/7] Restoring data & metadata from repo + dumped user/3rd party data"
mongorestore --dir ./dump

echo "[6/7] Erasing temporary folder/data used for restore/upgrade process"
rm -rf ./dump

echo "[7/7] Restore DB complete"
