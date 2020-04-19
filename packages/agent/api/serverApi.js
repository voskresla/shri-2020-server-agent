const axios = require('axios')
const https = require('https');

const serverRoutes = {
	notifyAgent: '/notify-agent',
	notifyAgentBuild: '/notify-agent-build',
}

const defaultHTTPClient = axios.create({
	baseURL: `${process.env.SERVERHOST}:${process.env.SERVERPORT}`,
});

class ServerApi {
	constructor(api) {
		this.api = api || defaultHTTPClient
	}

	notifyServer(host, port, body) {
		const url = `http://${host}:${port}${serverRoutes.notifyAgent}`

		return this.api.post(url, body)
	}

	notifyServerBuild(host, port, buildResult) {
		const url = `http://${host}:${port}${serverRoutes.notifyAgentBuild}`

		// server.routes: /notify-agent-build
		return this.api.post(url, buildResult)
	}
}

module.exports = ServerApi