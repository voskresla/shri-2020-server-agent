const express = require('express');
const router = express.Router();

const CiServer = require('../model/server')



/* GET home page. */
router.get('/', function (req, res, next) {
	CiServer.processBuildList()
	res.send('ddd');
});

module.exports = router;
