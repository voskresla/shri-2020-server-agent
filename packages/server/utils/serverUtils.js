const agentStatus = {
	BUSY: 'busy',
	FREE: 'free'
}

const getFirstAppropriateBuild = builds => builds.find(e => e.status === 'Waiting')
const getFirstFreeAgent = agents => agents.find(e => e.status === agentStatus.FREE)
const markAgentBusy = (agents, id) => agents.find(e => e.id === id).status = agentStatus.BUSY
const popBuild = (builds, id) => builds.filter(e => e.id !== id)


module.exports = {
	agentStatus,
	getFirstAppropriateBuild,
	getFirstFreeAgent,
	markAgentBusy,
	popBuild
}