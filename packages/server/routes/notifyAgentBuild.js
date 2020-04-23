const express = require('express');
const router = express.Router();
const notifyAgentBuildController = require('../controllers/notifyAgentBuildController').notifyAgentBuildController

/**
* req.body:buildResultModel {
* 		id:
* 		status:
* 		stdout:
* 		stderr:
* }
*/
router.post('/', function (req, res) {
	// в любом случае отвечаем 200:OK
	res.status(200).send({ status: 'OK', message: 'Server: build result received' });

	console.log(req.body)
	// потом разбираемся.
	notifyAgentBuildController(req.body)
});

module.exports = router;
