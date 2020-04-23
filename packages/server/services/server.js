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
const { buildStatusEnum } = require('../utils/utils')

const YndxApi = new yndxapi()
const AgentApi = new agentapi()

class CiServer {

	constructor() {
		this.builds = []
		this.agents = []
		// TODO: implement real settings
		this.configuration = {
			id: "b42c7bb2-09b2-4671-9b9f-2d82395ee4c0",
			repoName: "voskresla/voskresla.github.io",
			buildCommand: "npm run build && npm run test",
			mainBranch: "master",
			period: 20
		}
	}

	init() {
		this.getBuilds()
		this.processBuildList()
	}

	getBuilds() {
		const interval = 10000

		log.success(`Check new builds every ${interval}ms.`)

		const checkBuildsInterval = setInterval(
			() => {
				YndxApi.getBuilds()
					.then(({ data: builds }) => {
						this.builds = builds.data
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
					log.success(`\nTry run build:${build.id} on agent:${agent.id}`)
					this.runBuildOnAgent(agent, build)
						.then(() => {
							this.setBuildStart(build)
						})
						.then(() => {
							log.success(`  -> Succesfuly run build on Agent.\n`)
						})
						.catch(e => log.error('CiServer: runBuildOnAgent()'))
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
			buildCommand: this.configuration.buildCommand
		}

		try {
			const response = await AgentApi.runBuild(agent, jobBuildModel)
			markAgentBusy(this.agents, agent.id, jobBuildModel.id)
			log.success(response)
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

	setBuildStart(buildInfo) {
		return new Promise((resolve, reject) => {
			const { id } = buildInfo

			YndxApi.startBuild(id)
				.then(() => {
					this.builds = popBuild(this.builds, id)
					resolve()
				})
				.catch(e => reject('FIREFIRE'))
		})
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
		} catch (e) {
			throw new Error(`Error in mark agent as free`)
		}

		this.saveBuildResultToYandexApi(buildResult)
			.then(() => {
				log.success('  -> Save build result to store.\n')
			})
			.catch(e => {
				// log.error('', e)

				// log.error(' -> save build result to rottenFinishedResults.json')
				throw new Error(`Error in mark agent as free. \n ${e}`)
			})
	}

	/**
	 * handler for '/notify-agent 
	 */
	registerAgent(host, port) {
		const id = `${host}:${port}`
		const agentInfo = { id, host, port }

		if (addAgent(this.agents, agentInfo)) {
			log.success(`\nRegister new agent: ${host}:${port}\n`)
		} else {
			throw { type: 'BL', message: `Agent ${host}:${port} try register twice.` }
		}
	}

	saveBuildResultToYandexApi(buildResult) {
		return new Promise((resolve, reject) => {
			const FinishBuildInput = {
				buildId: buildResult.id,
				duration: 0,
				success: buildStatusEnum[buildResult.status],
				buildLog: buildResult.stdout || buildResult.stderr
			}

			YndxApi.finishBuild(FinishBuildInput)
				.then(() => {
					resolve()
				})
				.catch(e => {
					reject(`ERROR:FailedToSaveResult -> setBuildFinish() -> YndxApi.finishBuild -> ${e.response.status}`)
				})
		})
	}

	saveBuildResultToRottenDB(buildResult) {
		// TODO: add lowdb implementation
	}
}

module.exports = new CiServer()