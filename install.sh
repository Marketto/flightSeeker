#!/bin/bash
sh ./database/restore.sh && cd presentation && npm install --production && npm run-script build
