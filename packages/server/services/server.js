const log = require('../utils/chalkLogger')
const yndxapi = require('../api/yndxApi')
const agentapi = require('../api/agentApi')
const {
	getFirstAppropriateBuild,
	getFirstFreeAgent,
	markAgentBusy,
	markAgentFree,
	popBuild,
	addAgent } = require('../utils/serverUtils')

const YndxApi = new yndxapi()
const AgentApi = new agentapi()

class CiServer {

	constructor() {
		this.builds = []
		this.agents = []
		// TODO: implement real settings
		this.configuration = {
			// id: "b42c7bb2-09b2-4671-9b9f-2d82395ee4c0",
			// repoName: "voskresla/voskresla.github.io",
			// buildCommand: "node npm run build",
			// mainBranch: "master",
			// period: 20
		}
	}

	async init() {

		this.getSettings()
		this.getBuilds()
		this.processBuildList()

	}

	/**
	 * handler for '/notify-agent 
	 */
	registerAgent(host, port) {
		const id = `${host}:${port}`
		const agentInfo = { id, host, port }

		if (addAgent(this.agents, agentInfo)) {
			log.success(`Register new agent: ${host}:${port}`)
		} else {
			throw { type: 'BL', message: `Agent ${host}:${port} try register twice.` }
		}
	}

	async getSettings() {
		try {
			const response = await YndxApi.getConfiguration()
			this.configuration = {
				id: response.data.data.id,
				repoName: response.data.data.repoName,
				buildCommand: response.data.data.buildCommand,
				mainBranch: response.data.data.mainBranch,
				period: 20
			}
			log.success(`Take configuration.`)
		} catch (e) {
			log.error(`YNDX /conf don\`t response, try again later.`)
			process.exit()
		}
	}

	getBuilds() {
		const interval = 10000

		log.success(`Check new builds every ${interval}ms.`)

		const checkBuildsInterval = setInterval(
			() => {
				YndxApi.getBuilds()
					.then(({ data: builds }) => {
						this.builds = builds.data.filter(e => e.status === 'Waiting').reverse()
					})
					.catch(e => log.error('YndxApi: getBuilds() -> 500'))
			},
			interval
		)
	}

	processBuildList() {
		const interval = 5000

		const processInterval = setInterval(
			() => {
				const build = getFirstAppropriateBuild(this.builds)
				const agent = getFirstFreeAgent(this.agents)

				if (build && agent) {
					log.success(`Try run build:${build.id} on agent:${agent.id}`)
					this.runBuildOnAgent(agent, build)
				} else {
					log.log(`${build ? '' : 'Nothing to process.'}${build ? 'Have build:' + build.id + '.' : ' No builds.'}${agent ? ` ${this.agents.length} free agents` : ' No free agents'}`)
				}
			},
			interval
		)
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
	// TODO: возможно стоить сделать runBuild() и агента выбирать тут.
	async runBuildOnAgent(agent, build) {
		const jobBuildModel = {
			id: build.id,
			uri: `https://github.com/${this.configuration.repoName}`,
			commitHash: build.commitHash,
			buildCommand: this.configuration.buildCommand
		}

		try {
			const response = await AgentApi.runBuild(agent, jobBuildModel)
			markAgentBusy(this.agents, agent.id, jobBuildModel.id)
			log.success(response)

			this.setBuildStart(build.id)
		} catch (e) {
			// error control flow:
			// - type: 'HTTP' -> ...delete agent -> try send build for another agent -> if no free agents save to quie DB
			// - type: 'BL': -> ...mock for feature implementation
			switch (e.type) {
				case 'HTTP':
					log.error(e.message)
					log.error(`Agent ${agent.id} dead. TODO: feature implementations`)
					// TODO: delete agent
					// TODO: send build for another agent logic
					break;
				case 'BL':
					log.test('TODO: mock for feature BL logic implementation')
					break;
				default:
					log.error(e)
					// TODO: unhandled error logic implementation
					break;
			}
		}
	}

	async setBuildStart(buildId) {
		try {
			const response = await YndxApi.startBuild(buildId)
			this.builds = popBuild(this.builds, buildId)
		} catch (e) {
			log.error(e)
		}
	}

	/**
	 * buildResultModel: {
	 * 		id:
	 * 		status:
	 * 		stdout:
	 * 		stderr:
	 * }
	 */
	processBuildResult(buildResult) {
		log.success(`\nRecieve result for build:${buildResult.id}`)

		try {
			markAgentFree(this.agents, buildResult.id)
			this.saveBuildResultToYandexApi(buildResult)
		} catch (e) {
			log.error(e)
		}
	}


	async saveBuildResultToYandexApi(buildResult) {
		console.log(buildResult.duration)
		const FinishBuildInput = {
			buildId: buildResult.id,
			duration: Number(buildResult.duration),
			success: buildResult.status,
			buildLog: '' + buildResult.stdout + buildResult.stderr
		}

		try {
			const result = await YndxApi.finishBuild(FinishBuildInput)
			log.success(result)
		} catch (e) {
			// error control flow:
			// - type: 'HTTP' -> ...retry
			// - type: 'BL': -> ...log -> выяснять почему от агента пришли данные в плохом формате
			switch (e.type) {
				case 'HTTP':
					log.error(e.message)
					log.error(`YNDX down. TODO: retry feature implementations `)
					break;
				case 'BL':
					log.test('TODO: mock for feature BL logic implementation')
					break;
				default:
					log.error(e)
					log.error('Check data from AGENT')
					// TODO: unhandled error logic implementation
					break;
			}
		}
	}



	saveBuildResultToRottenDB(buildResult) {
		// TODO: add lowdb implementation
	}
}

module.exports = new CiServer()