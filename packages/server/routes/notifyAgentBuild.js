var express = require('express');
var router = express.Router();

const CiServer = require('../model/server')

router.post('/', function (req, res, next) {
	// id сборки, статус, лог (stdout и stderr процесса).
	CiServer.processBuildResult(req.body)
	res.send('respond with a resource');
});

module.exports = router;
