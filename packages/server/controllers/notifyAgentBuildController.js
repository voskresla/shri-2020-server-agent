const CiServer = require('../services/server')

// buildResultModel = {
// 		id: string
// 		status: buildStatusEnum
// 		stdout: string
// 		stderr: string
// }

exports.notifyAgentBuildController = (buildResultModel) => {
	CiServer.processBuildResult(buildResultModel)
}