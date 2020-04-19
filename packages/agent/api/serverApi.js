const axios = require('axios')
const https = require('https');

const defaultHTTPClient = axios.create({
	baseURL: `${process.env.SERVERHOST}:${process.env.SERVERPORT}`,
});

class AgentApi {
	constructor(api) {
		this.api = api || defaultHTTPClient
	}

	runBuild(config, payload) {
		const { host, port } = config
		const url = `${host}:${port}`

		// TODO: change to real implementation
		return Promise.resolve()
		// return this.api.post(url, payload)
	}
}

module.exports = AgentApi