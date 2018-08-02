#!/bin/bash
cd "$PWD" && cd /database
sh ./restore.sh
cd "$PWD" && cd /business
npm install --production
cd "$PWD" && cd /presentation
npm install --production
npm build
