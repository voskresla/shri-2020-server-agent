const Agent = require('../model/agent')

/**
 * jobBuildModel = {
 * 		id: '5ecc8837-0f7a-49be-9879-20e92eefaacc',
 * 		uri: '',
 * 		buildCommand: '',
 * }
 */
exports.buildController = (jobBuildModel) => {
	// здесь мы можем обрабатывать приходящие данные и передаем куда хотим
	Agent.processBuild(jobBuildModel)
}