const { buildStatusEnum } = require("../utils/utils");

// getBuildResult
const getBuildResult = (build, settings) => {
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