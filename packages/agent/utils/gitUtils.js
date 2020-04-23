const { buildStatusEnum } = require("../utils/utils");

// buildResultModel = {
// 		id: build.id,
// 		status: buildStatusEnum.SUCCESS,
// 		stdout: 'mock STDOUT string from real build implementation',
// 		stderr: 'mock STDERR string from real build implementation'
// }

// TODO: implement real build process
const getBuildResult = (jobBuildModel) => {
	return new Promise((resolve, reject) => {
		Math.round(Math.random())
			? setTimeout(
				() => {
					resolve({
						log: 'Mocked log string',
						status: buildStatusEnum.SUCCESS
					})
				},
				5000
			)
			: reject({
				log: 'Error in git on agent',
				status: buildStatusEnum.FAIL
			})
	})
}

module.exports = {
	getBuildResult
}