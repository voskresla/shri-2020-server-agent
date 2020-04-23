const axios = require('axios')
const https = require('https');

const log = require('../utils/chalkLogger')

const defaultHTTPClient = axios.create({
	baseURL: process.env.APIBASEURL,
	headers: {
		Authorization: `Bearer ${process.env.APITOKEN}`,
	},
	httpsAgent: new https.Agent({
		rejectUnauthorized: false,
	}),
});

class YndxApi {
	constructor(httpClient) {
		this.httpClient = httpClient || defaultHTTPClient
	}

	getBuilds() {
		return this.httpClient.get('/build/list/')
	}

	getConfiguration() {
		return this.httpClient.get('/conf')
	}

	async startBuild(buildId) {
		const dateTime = new Date().toISOString()
		const StartBuildInput = { buildId, dateTime }
		return this.httpClient.post('/build/start/', StartBuildInput)
	}

	async finishBuild(FinishBuildInput) {
		try {
			// 200: 
			// 400: 
			// 500: 
			const response = await this.httpClient.post('/build/finish/', FinishBuildInput)

			if (response.status > 400) {
				throw { type: 'BL', message: response }
			}
			if (response.status === 500) {
				throw { type: 'HTTP', message: '/build/finish -> 500' }
			}
			if (response.status === 200) {
				return 'Succesfully set finish on YNDX'
			}
		} catch (e) {
			throw e
		}
	}
}

module.exports = YndxApi