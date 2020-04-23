const axios = require('axios')
const https = require('https');

const defaultHTTPClient = axios.create();

class AgentApi {
	constructor(httpClient) {
		this.httpClient = httpClient || defaultHTTPClient
	}

	/**
	 * agentModel {
	 * 		id: `${host}:${port}`,
	 * 		host:
	 * 		port:
	 * }
	 */
	/**
	 * jobBuildModel {
	 * 		id: '5ecc8837-0f7a-49be-9879-20e92eefaacc',
	 * 		uri: '',
	 * 		buildCommand: '',
	 * }
	 */
	async runBuild(agent, jobBuildModel) {
		const { host, port } = agent
		const url = `http://${host}:${port}/build`

		// agent.routes: /build
		try {
			// 200: {status: 'OK', message: 'Agent: receive job for ${req.body.id}'}
			const response = await this.httpClient.post(url, jobBuildModel)

			if (response.status === 200 && response.data.status !== 'OK') {
				throw { type: 'BL', message: response.data.message }
			}
			if (response.status === 500) {
				throw { type: 'HTTP', message: 'Agent: route /build -> 500' }
			}
			if (response.status === 200 && response.data.status === 'OK') {
				return response.data.message
			}
		} catch (e) {
			log.error(e.message)
			throw e
		}
	}
}

module.exports = AgentApi