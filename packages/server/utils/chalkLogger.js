const chalk = require('chalk');

const log = {
	error: (message, e = '') => console.log(chalk.red(`${message}\n${e}`)),
	success: message => console.log(chalk.green(message)),
	log: message => console.log(chalk.yellow(message)),
	test: (message, e = '') => console.log(chalk.red.bgWhite(`${message}\n${e}`))
}

module.exports = log