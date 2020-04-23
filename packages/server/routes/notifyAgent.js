const express = require('express');
const router = express.Router();
const log = require('../utils/chalkLogger')

const CiServer = require('../services/server')

// TODO: перенести это в контроллер?
router.post('/', (req, res) => {
	const { host, port } = req.body
	// TODO: переделать на контроллер
	try {
		CiServer.registerAgent(host, port)
		res.status(200).send({ status: 'OK', message: 'Server: agent successfuly registered.' });
	} catch (e) {
		// error control flow:
		// - type: 'BL': -> send error response to agent.
		switch (e.type) {
			case 'BL':
				log.error(e.message)
				res.status(200).send({ status: 'ERROR', message: 'Server: agent with this id already registered.' });
				break;
			default:
				log.error(e)
				break;
		}
	}
});

module.exports = router;
