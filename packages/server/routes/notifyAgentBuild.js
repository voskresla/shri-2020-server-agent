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
	res.status(200).send({ status: 'OK', message: 'Server: build result received' });
	notifyAgentBuildController(req.body)
});

module.exports = router;
