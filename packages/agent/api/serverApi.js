const axios = require('axios')
const log = require('../utils/chalkLogger')
const config = require('../config/agentConfig.json')

const serverRoutes = {
	notifyAgent: '/notify-agent',
	notifyAgentBuild: '/notify-agent-build',
}

const defaultHTTPClient = axios.create({
	baseURL: `${config.serverhost}:${config.serverport}`,
});

class ServerApi {
	constructor(httpClient) {
		this.httpClient = httpClient || defaultHTTPClient
	}

	async notifyServer(host, port, body) {
		const url = `http://${host}:${port}${serverRoutes.notifyAgent}`

		// server.routes: /notify-agent
		try {
			// 200: {status: 'OK', message: 'Server: agent successfuly registered.'}
			// 200: {status: 'ERROR', message: 'Server: agent with this id already registered.'}
			const response = await this.httpClient.post(url, body)

			if (response.status === 200 && response.data.status !== 'OK') {
				throw { type: 'BL', message: response.data.message }
			}
			if (response.status === 500) {
				throw { type: 'HTTP', message: 'Server: route /notify-agent -> 500' }
			}
			if (response.status === 200 && response.data.status === 'OK') {
				return response.data.message
			}
		} catch (e) {
			log.error(e.message)
			throw e
		}
	}

	async notifyServerBuild(host, port, buildResult) {
		const url = `http://${host}:${port}${serverRoutes.notifyAgentBuild}`

		// server.routes: /notify-agent-build
		try {
			// 200: {status: 'OK', message: '...'}
			// 200: {status: 'ERROR', message: '...'} 
			const response = await this.httpClient.post(url, buildResult)

			if (response.status === 200 && response.data.status !== 'OK') {
				throw { type: 'BL', message: response.data.message }
			}
			if (response.status === 500) {
				throw { type: 'HTTP', message: 'Server: route /notify-agent-build -> 500' }
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

module.exports = ServerApi