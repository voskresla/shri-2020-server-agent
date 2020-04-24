const log = require('../utils/chalkLogger')
const { agentStatusEnum, buildStatusEnum, parseHrtimeToSeconds } = require("../utils/utils");
const gitUtils = require('../utils/gitUtils')


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

	init(selfHost, selfPort, remoteHost, remotePort) {
		log.success(`Agent: Initialize Agent on PORT:${selfPort}.`)

		this.port = selfPort
		this.host = selfHost
		this.remoteHost = remoteHost
		this.remotePort = remotePort

		this.registerOnServer()
	}

	// notifyAgentModel = {
	// 		host: 
	// 		post: 
	// }
	async registerOnServer() {
		const serverUrl = `http://${this.remoteHost}:${this.remotePort}`
		const selfUrl = `${this.host}:${this.port}`
		const body = { host: this.host, port: this.port }

		log.success(`Agent: Try register AGENT:${selfUrl} on SERVER:${serverUrl}`)

		try {
			const response = await ServerApi.notifyServer(this.remoteHost, this.remotePort, body)
			log.success(response)
		} catch (e) {
			// error control flow:
			// - type: 'HTTP' -> ...retry register in feature implementation (сейчас process.exit())
			// - type: 'BL': already registered / etc -> ...process.exit()
			switch (e.type) {
				case 'HTTP':
					log.test('TODO: retry register on server')
					process.exit()
					break;
				case 'BL':
					process.exit()
					break;
				default:
					process.exit()
					break;
			}
		}
	}

	/**
	 * jobBuildModel {
	 * 		id: '5ecc8837-0f7a-49be-9879-20e92eefaacc',
	 * 		uri: '',
	 * 		buildCommand: '',
	 * }
	 */
	async processBuild(jobBuildModel) {
		log.success(`Agent: start processing for build: ${jobBuildModel.id}`)

		const startTime = process.hrtime();

		try {
			this.status = agentStatusEnum.BUSY

			// TODO: gitUtils переделать на error logic throw
			const result = await gitUtils.getBuildResult(jobBuildModel)
			log.success(`Agent: build ${jobBuildModel.id} job DONE.`)

			const durationTime = parseHrtimeToSeconds(process.hrtime(startTime));
			result.duration = durationTime

			this.sendBuildResultToServer(result)
		} catch (e) {
			log.error(`Agent: npm processing for build:${jobBuildModel.id} job FAIL.`)

			this.status = agentStatusEnum.FREE

			const durationTime = parseHrtimeToSeconds(process.hrtime(startTime));
			e.duration = durationTime

			this.sendBuildResultToServer(e) // e = buildResult -> переделать на error flow
		}
	}

	async sendBuildResultToServer(buildResultModel) {
		log.success('Agent: try send result to SERVER.')

		try {
			const response = await ServerApi.notifyServerBuild(this.remoteHost, this.remotePort, buildResultModel)
			this.status = agentStatusEnum.FREE

			log.success(response)
		} catch (e) {
			// error control flow:
			// - type: 'HTTP' -> ...retry send result in feature implementation (сейчас set status FREE)
			// - type: 'BL': already registered / etc -> ...process.exit()
			switch (e.type) {
				case 'HTTP':
					log.test('TODO: retry send result on server')
					this.status = agentStatusEnum.FREE
					break;
				case 'BL':
					log.test('TODO: mock for feature implementation')
					this.status = agentStatusEnum.FREE
					break;
				default:
					log.error(e)
					process.exit()
					break;
			}
		}
	}

}

module.exports = new Agent()