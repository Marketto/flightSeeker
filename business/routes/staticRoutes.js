const express = require('express');
const router = express.Router();
const path = require('path');
const PUBLIC_PATH = path.join(__dirname, '../', 'public');

/* GET home page. */
//router.use('/assets', express.static('public/assets'));
//router.use(/\.(?:js|css|svg|eot|ttf|woff|txt|png|jpg|ico|map)$/i, express.static('public'));

router.use(express.static(PUBLIC_PATH));
router.use((req, res) => res.sendFile(`${PUBLIC_PATH}/index.html`));

module.exports = router;