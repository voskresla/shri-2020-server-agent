var express = require('express');
var router = express.Router();
const CiServer = require('../model/server')


/* GET users listing. */
router.get('/', function (req, res, next) {
	CiServer.echoBuildList()
	res.send('respond with a resource');
});

module.exports = router;
