#!/bin/bash
sh ./database/restore.sh
cd business
npm install
cd presentation
npm install
npm build
