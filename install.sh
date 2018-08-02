#!/bin/bash
sh ./database/restore.sh
#npm install --production ./business
#npm install --production ./presentation
npm build ./presentation
