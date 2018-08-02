#!/bin/bash
sh ./database/restore.sh && cd presentation && npm install -g @angular/cli && npm install --production && npm run-script build
