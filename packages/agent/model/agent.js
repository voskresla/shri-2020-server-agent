const os = require("os");
const log = require('../utils/chalkLogger')
const { agentStatusEnum, buildStatusEnum } = require("../utils/utils");
// const gitApi = require('../utils/gitUtils')


const serverApi = require('../api/serverApi')
const ServerApi = new serverApi()

class Agent {
	constructor() {
		this.host = ''
		this.port = ''
		this.remoteHost = ''
		this.remotePort = ''
		this.status = agentStatusEnum.FREE
	}

	init(port) {
		log.success(`Initialize Agent on PORT:${port}.`)

		this.port = port
		this.host = os.networkInterfaces().lo0[0].address
		this.remoteHost = process.env.SERVERHOST
		this.remotePort = process.env.SERVERPORT

		this.registerOnServer()
	}

	registerOnServer() {
		const serverUrl = `http://${this.remoteHost}:${this.remotePort}`
		const selfUrl = `${this.host}:${this.port}`
		const body = { host: this.host, port: this.port }

		log.success(`\nTry register AGENT:${selfUrl} on SERVER:${serverUrl}`)

		ServerApi.notifyServer(this.remoteHost, this.remotePort, body)
			.then(() => log.success('  -> successfuly register.'))
			.catch(e => log.error('\nAgent: registerOnServer(). Server don\'t response.'))
	}

	// TODO: implement real build process
	processBuild(build, settings = undefined) {
		log.success(`\nStart processing for build:${build.id}`)

		gitApi.runBuildJob(build, settings)
			.then((buildResult) => {
				log.test('runBuildJob:result -> buildResult', e)
			})
			.then(() => {

			})
			.catch(e => console.log('hm'))

		// id сборки, статус, лог (stdout и stderr процесса).
		const buildResult = {
			id: build.id,
			status: buildStatusEnum.SUCCESS,
			stdout: 'mock STDOUT string from real build implementation',
			stderr: 'mock STDERR string from real build implementation'
		}


		setTimeout(() => this.sendBuildResultToServer(buildResult), 5000)
	}

	sendBuildResultToServer(buildResult) {
		log.success(' -> Try send result to SERVER.')
		ServerApi.notifyServerBuild(this.remoteHost, this.remotePort, buildResult)
			.then(() => log.success(' -> successfully send build result to server.'))
			.catch(e => log.error('Agent: sendBuildResultToServer(). Server don\'t response.', e))
	}

}

module.exports = new Agent()