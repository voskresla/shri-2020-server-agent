const express = require('express');
const router = express.Router();

const Agent = require('../model/agent')

router.post('/', function (req, res, next) {
	Agent.processBuild(req.body)
	res.send('recieved')
});

module.exports = router;
