#!/bin/bash
sh ./database/restore.sh
cd /business
npm install --production
cd ../presentation
npm install --production
npm build
