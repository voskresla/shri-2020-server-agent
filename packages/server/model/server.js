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
					log.log(`${build ? '' : 'Nothing to process.'}${build ? ' Have build:' + build.id + '.' : ' No builds.'}${agent ? ` ${this.agents.length} free agents` : ' No free agents'}`)
				}
			},
			interval
		)
	}

	runBuildOnAgent(agentInfo, buildInfo) {
		return new Promise((resolve, reject) => {
			const { id: agentId } = agentInfo
			const { id: buildId } = buildInfo
			const payload = buildInfo

			AgentApi.runBuild(agentInfo, payload)
				.then(() => {
					try {
						markAgentBusy(this.agents, agentId, buildId)
					} catch (e) {
						log.error('Utils: markAgentBusy()')
					}
					resolve()
				})
				.catch(e => {
					log.error('CiServer: AgentApi.runBuild()')
					reject()
				})
		})
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
	 * handler for '/notify-agent-build 
	 *
	 * buildResult: {
	 * 		id:
	 * 		status:
	 * 		stdout:
	 * 		stderr:
	 * }.
	 */
	processBuildResult(buildResult) {
		const { id: buildId } = buildResult
		log.success(`\nRecieve result for build:${buildId}`)

		markAgentFree(this.agents, buildId)

		this.saveBuildResultToYandexApi(buildResult)
			.then(() => {
				log.success('  -> Save build result to store.\n')
			})
			.catch(e => {
				log.error('', e)
				this.saveBuildResultToRottenDB(buildResult)
				log.error(' -> save build result to rottenFinishedResults.json')
			})
	}

	/**
	 * handler for '/notify-agent 
	 */
	registerAgent(host, port) {
		const id = `${host}:${port}`
		const agentInfo = { id, host, port }

		addAgent(this.agents, agentInfo)
			? log.success(`\nRegister new agent: ${host}:${port}\n`)
			: log.error(`\nAgent ${host}:${port} try register twice.\n`)
	}

	saveBuildResultToYandexApi(buildResult) {
		return new Promise((resolve, reject) => {
			const FinishBuildInput = {
				buildId: buildResult.id,
				duration: 0,
				success: buildStatusEnum[buildResult.status],
				buildLog: buildResult.stdout || buildResult.stderr
			}

			// TODO: если 500 - положить результат в rottenFinishResults.json: {id,duration,status,log}
			YndxApi.finishBuild(FinishBuildInput)
				.then(() => {
					resolve()
				})
				.catch(e => {
					reject(`ERROR:FailedToSaveResult -> setBuildFinish() -> YndxApi.finishBiuld -> ${e.response.status}`)
				})
		})
	}

	saveBuildResultToRottenDB(buildResult) {

	}
}

module.exports = new CiServer()