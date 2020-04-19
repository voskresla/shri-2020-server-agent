const axios = require('axios')
const https = require('https');

const defaultHTTPClient = axios.create();

class AgentApi {
	constructor(api) {
		this.api = api || defaultHTTPClient
	}

	/**
	 * handler for POST to Agent '/build 
	 */
	runBuild(config, payload) {
		const { host, port } = config
		const url = `http://${host}:${port}/build`

		// TODO: change to real implementation
		// return Promise.resolve()
		return this.api.post(url, payload)
	}
}

module.exports = AgentApi