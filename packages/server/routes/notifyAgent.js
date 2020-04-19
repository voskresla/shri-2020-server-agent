const express = require('express');
const router = express.Router();

const CiServer = require('../model/server')




router.post('/', function (req, res, next) {
	const { host, port } = req.body
	CiServer.registerAgent(host, port)
	res.send('ddd');
});

module.exports = router;
