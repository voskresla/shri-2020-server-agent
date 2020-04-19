const yndxapi = require('../api/yndxApi')
const agentapi = require('../api/agentApi')
const { agentStatus, getFirstAppropriateBuild, getFirstFreeAgent, markAgentBusy, popBuild } = require('../utils/serverUtils')

const YndxApi = new yndxapi()
const AgentApi = new agentapi()

class CiServer {

	constructor() {
		this.builds = []
		this.agents = [
			{ id: 'http://localhost:5001', host: 'http://localhost', port: '5001', status: agentStatus.FREE },
			{ id: 'http://localhost:5002', host: 'http://localhost', port: '5002', status: agentStatus.FREE },
			{ id: 'http://localhost:5003', host: 'http://localhost', port: '5003', status: agentStatus.FREE },
		]
	}

	init() {
		this.getBuilds()
		this.processBuildList()
	}

	getBuilds() {
		const checkBuildsInterval = setInterval(
			() => {
				console.log('Check new builds.')
				YndxApi.getBuilds()
					.then(({ data: builds }) => {
						this.builds = builds.data
					})
					.catch(e => console.error('ERROR: CiCerver: getBuilds()', e))
			},
			10000
		)
	}

	processBuildList() {
		const processInterval = setInterval(
			() => {
				console.log('Start process build...')
				const build = getFirstAppropriateBuild(this.builds)
				const agent = getFirstFreeAgent(this.agents)

				if (build && agent) {
					console.log(`Try run build#${build.id} on agent#${agent.id}...`)
					this.runBuildOnAgent(agent, build)
						.then(() => this.setBuildStart(build))
						.then(() => {
							console.log(`Success.`)
						})
						.catch(e => console.error('ERROR: runBuildOnAgent', e))
				} else {
					console.log(`Nothing to process. ${build ? 'build#' + build.id + '.' : 'No builds. '} ${agent ? '' : 'No free agents'}`)
				}
			},
			5000
		)
	}

	runBuildOnAgent(agentInfo, buildInfo) {
		return new Promise((resolve, reject) => {
			const { id } = agentInfo

			AgentApi.runBuild(agentInfo, buildInfo)
				.then(() => {
					markAgentBusy(this.agents, id)
					resolve(id)
				})
				.catch(e => reject(e))
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
				.catch(e => reject(e))
		})
	}

	/**
	 * handler for '/notify-agent-build 
	 */
	processBuildResult(agent, build, result) {
		// mark agent FREE

		// mark 
	}

	/**
	 * handler for '/notify-agent 
	 */
	registerAgent(host, port) {
		// add agent to this.agents

	}

	saveBuildResultToStore() {

	}
}

module.exports = new CiServer()