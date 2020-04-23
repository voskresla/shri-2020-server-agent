const { buildStatusEnum } = require("../utils/utils");
const path = require('path')

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const log = require('./chalkLogger')

// return buildResultModel = {
// 		id: build.id,
// 		status: buildStatusEnum.SUCCESS,
// 		stdout: 'mock STDOUT string from real build implementation',
// 		stderr: 'mock STDERR string from real build implementation'
// }

/**
 * jobBuildModel {
 * 		id: '5ecc8837-0f7a-49be-9879-20e92eefaacc',
 * 		uri: '',
 * 		commitHash, ''
 * 		buildCommand: '',
 * }
 */

// TODO: implement real build process
const getBuildResult = async (jobBuildModel) => {
	try {
		log.success('Agent: start cloning repositroy');
		await gitClone(jobBuildModel)
		log.success(`Agent: finish cloning repositroy`);
		
		log.success(`Agent: start exec build command`);
		
		const { stdout, stderr } = await npmRun(jobBuildModel)


		return {
			id: jobBuildModel.id,
			status: buildStatusEnum.SUCCESS,
			stdout,
			stderr
		}
	} catch (e) {
		throw {
			id: jobBuildModel.id,
			status: buildStatusEnum.FAIL,
			stdout: e.stdout,
			stderr: e.stderr
		}
	}
}

const gitClone = async (jobBuildModel) => {
	const { id, uri: path, commitHash } = jobBuildModel
	const sh = `git clone ${path}.git ${id} && cd ${id} && git reset --hard ${commitHash}`

	try {
		const { stdout, stderr } = await execAsync(sh, {
			cwd: './repos/',
			env: { GIT_TERMINAL_PROMPT: '0', FORCE_COLOR: true },
		});
		return { stdout, stderr };
	} catch (e) {
		log.error(`Agent: git FAIL cloning repositroy, with code: ${e.code}`);
		throw {
			stdout: e.stdout,
			stderr: e.stderr ? e.stderr : e.toString(),
		};
	}
}

const npmRun = async (jobBuildModel) => {
	const sh = jobBuildModel.buildCommand
	const pathTo = path.resolve('./repos/', `${jobBuildModel.id}`)
	
	try {
		const { stdout, stderr } = await execAsync(sh, {
			cwd: pathTo,
			// env: { FORCE_COLOR: true }
		});

		return { stdout, stderr };
	} catch (e) {
		log.error(`Agent: npm FAIL exec, with code: ${e.code}`);

		throw {
			stdout: e.stdout,
			stderr: e.stderr,
		};
	}
}


module.exports = {
	getBuildResult
}