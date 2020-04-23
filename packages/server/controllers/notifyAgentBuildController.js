const CiServer = require('../services/server')

// buildResultModel = {
// 		id: build.id,
// 		status: buildStatusEnum.SUCCESS,
// 		stdout: 'mock STDOUT string from real build implementation',
// 		stderr: 'mock STDERR string from real build implementation'
// }

exports.notifyAgentBuildController = (buildResultModel) => {
	CiServer.processBuildResult(buildResultModel)
}