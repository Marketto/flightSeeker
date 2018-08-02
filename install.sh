#!/bin/bash
cd "$PWD/database"
sh ./restore.sh
cd "$PWD/business"
npm install --production
cd "$PWD/presentation"
npm install --production
npm build
