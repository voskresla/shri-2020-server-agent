const express = require('express');
const router = express.Router();
const notifyAgentController = require('../controllers/notifyAgentController').notifyAgentController



// TODO: перенести это в контроллер?
router.post('/', (req, res) => {
	try {
		notifyAgentController(req.body)
		res.status(200).send({ status: 'OK', message: 'Server: agent successfuly registered.' });
	} catch (e) {
		switch (e.type) {
			case 'BL':
				res.status(200).send({ status: 'ERROR', message: 'Server: agent with this id already registered.' });
				throw e
				break;
			default:
				log.error(e)
				res.status(200).send({ status: 'ERROR', message: 'Server: unhandled error.' });
				break;
		}
	}
});

module.exports = router;
