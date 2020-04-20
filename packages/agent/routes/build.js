// TODO: заведи babel для декораторов.
const { catchErrorAsync, catchError } = require('../utils/utils')
const { agentStatusEnum, buildStatusEnum } = require("../utils/utils");

const express = require('express');
const router = express.Router();

const log = require('../utils/chalkLogger')

const Agent = require('../model/agent')

/**
 * req.body = {
 * 		id: '5ecc8837-0f7a-49be-9879-20e92eefaacc',
 * 		configurationId: 'b42c7bb2-09b2-4671-9b9f-2d82395ee4c0',
 * 		buildNumber: 108,
 * 		commitMessage: 'string',
 * 		commitHash: 'string',
 * 		branchName: 'string',
 * 		authorName: 'string',
 * 		status: 'Waiting'
 * }
 */
router.post('/', function (req, res, next) {
	console.log(req.body)
	try {
		Agent.processBuild(req.body)
	} catch (e) {
		const buildResult = {
			id: req.body.id,
			status: buildStatusEnum.FAIL,
			stdout: '',
			stderr: 'Error on Agent:processBuild()'
		}

		Agent.sendBuildResultToServer(buildResult)
		log.test(`ERROR recieve build`, e)
	}

	res.send({ status: 'OK' })
});

module.exports = router;
