const agentStatus = {
	BUSY: 'busy',
	FREE: 'free'
}

const getFirstAppropriateBuild = builds => builds.find(e => e.status === 'Waiting')

const getFirstFreeAgent = agents => agents.find(e => e.status === agentStatus.FREE)

const markAgentBusy = (agents, agentId, buildId) => {
	const agent = agents.find(e => e.id === agentId)
	agent.status = agentStatus.BUSY
	agent.buildId = buildId
}

const markAgentFree = (agents, buildId) => {
	const agent = agents.find(e => e.buildId === buildId)
	agent.status = agentStatus.FREE
	agent.buildId = ''
}

const popBuild = (builds, id) => builds.filter(e => e.id !== id)

const addAgent = (agents, agentInfo) => {
	const { id } = agentInfo
	if (agents.find(e => e.id === id)) return false

	agents.push({ ...agentInfo, status: agentStatus.FREE, buildId: '' })
	return true
}

module.exports = {
	agentStatus,
	getFirstAppropriateBuild,
	getFirstFreeAgent,
	markAgentBusy,
	popBuild,
	addAgent,
	markAgentFree
}