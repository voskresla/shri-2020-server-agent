const log = require('./chalkLogger')

const agentStatusEnum = {
	BUSY: 'busy',
	FREE: 'free'
};
exports.agentStatusEnum = agentStatusEnum;

const buildStatusEnum = {
	SUCCESS: true,
	FAIL: false
};
exports.buildStatusEnum = buildStatusEnum;

exports.catchError = function catchError(target, name, descriptor, message = 'default message') {
	const original = descriptor.value;
	if (typeof original === 'function') {
		descriptor.value = function (...args) {
			try {
				return original.apply(this, args);
			} catch (e) {
				log.error(`${message}\n${e}`)
				// Sentry.captureException(e); // report to some metrics service
			}
		}
	}
}

exports.catchErrorAsync = function catchErrorAsync(target, name, descriptor, message = 'default message') {
	const original = descriptor.value;
	if (typeof original === 'function') {
		descriptor.value = async function (...args) {
			try {
				return await original.apply(this, args);
			} catch (e) {
				log.error(`${message}\n${e}`)
				// Sentry.captureException(e); // report to some metrics service
			}
		}
	}
}
