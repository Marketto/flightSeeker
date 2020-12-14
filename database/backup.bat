echo "[0/4] Starting DB backup process"

echo "[1/4] Performing dump/backup of existing collections";
mongodump --db flightSeeker --out .

echo "[2/4] Deleting user-related and 3rd party data"
del flightSeeker\flightLists.bson
del flightSeeker\flights.bson
del flightSeeker\users.bson

echo "[3/4] Prettyfing metadata"
node prettify-metadata.js

echo "[4/4] Backup DB complete"
