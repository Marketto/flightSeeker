#!/bin/node
const fs = require('fs');
const path = require('path');

const DB_NAME = 'flightSeeker';


const targetPath = path.join(process.cwd(), DB_NAME);

const prettify = text => JSON.stringify(JSON.parse(text), null, 4);

// Reading database folder
fs.readdirSync(targetPath)
    // Filtering only json files
    .filter(fileName => (/\.json$/i).test(fileName))
    // Mapping to filePath
    .map(fileName => path.join(targetPath, fileName))
    // Prettyfing
    .forEach(filePath => fs.writeFileSync(filePath, prettify(fs.readFileSync(filePath, {encoding: 'utf8'}))));