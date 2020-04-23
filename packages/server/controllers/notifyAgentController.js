const CiServer = require('../services/server')

// notifyAgentModel = {
// 		host: 
// 		post: 
// }

exports.notifyAgentController = (body) => {
	const { host, port } = body
	// TODO: переделать на контроллер
	try {
		CiServer.registerAgent(host, port)
	} catch (e) {
		// error control flow:
		// - type: 'BL': -> send error response to agent.
		switch (e.type) {
			case 'BL':
				log.error(e.message)
				throw e
				break;
			default:
				log.error(e)
				throw e
				break;
		}
	}
}