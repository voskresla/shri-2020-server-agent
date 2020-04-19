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
	 * buildResult: id сборки, статус, лог (stdout и stderr процесса).
	 */
	processBuildResult(buildResult) {
		const { id: buildId } = buildResult

		log.success(`\nRecieve result for build:${buildId}`)

		try {
			markAgentFree(this.agents, buildId)
		} catch (e) {
			console.log(e)
		}
		this.saveBuildResultToStore(buildResult)
			.then(() => {
				log.success('  -> Save build result to store.\n')
			})
			.catch(e => log.error('CiServer: processBuildResult()', e))
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

	saveBuildResultToStore(buildInfo) {
		return new Promise((resolve, reject) => {

			const FinishBuildInput = {
				buildId: buildInfo.id,
				duration: 0,
				success: buildInfo.status === 'Success' ? true : false,
				buildLog: buildInfo.stdout
			}

			YndxApi.finishBuild(FinishBuildInput)
				.then(() => {
					resolve()
				})
				.catch(e => reject('ERROR: setBuildFinish()'))
		})
	}
}

module.exports = new CiServer()