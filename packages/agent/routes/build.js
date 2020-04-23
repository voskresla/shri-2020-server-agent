// TODO: заведи babel для декораторов.
const { catchErrorAsync, catchError } = require('../utils/utils')

const express = require('express');
const router = express.Router();
const buildController = require('../controllers/buildController').buildController

/**
 * req.body: jobBuildModel {
 * 		id: '5ecc8837-0f7a-49be-9879-20e92eefaacc',
 * 		uri: '',
 * 		buildCommand: '',
 * }
 */
router.post('/', function (req, res, next) {
	res.send({ status: 'OK', message: `Agent: receive job for ${req.body.id}` })
	buildController(req.body)
});

module.exports = router;
