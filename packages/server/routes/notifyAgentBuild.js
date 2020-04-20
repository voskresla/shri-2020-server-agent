const express = require('express');
const router = express.Router();

const CiServer = require('../model/server')

/**
* req.body: buildResult: {
* 		id:
* 		status:
* 		stdout:
* 		stderr:
* }.
*/
router.post('/', function (req, res, next) {
	try {
		CiServer.processBuildResult(req.body)
	} catch (e) {
		log.test(`ERROR recieve build`, e)
	}
	res.send({ status: 'OK' });
});

module.exports = router;
