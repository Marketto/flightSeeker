#!/bin/bash
sh ./database/restore.sh && cd presentation && npm run-script build
