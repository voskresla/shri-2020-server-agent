const axios = require('axios')
const https = require('https');

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
	constructor(api) {
		this.api = api || defaultHTTPClient
	}

	getBuilds() {
		return this.api.get('/build/list/')
	}

	startBuild(buildId) {
		const dateTime = new Date().toISOString()
		const StartBuildInput = { buildId, dateTime }
		return this.api.post('/build/start/', StartBuildInput)
	}

	finishBuild(FinishBuildInput) {
		return this.api.post('build/finish', FinishBuildInput)
	}
}

module.exports = YndxApi