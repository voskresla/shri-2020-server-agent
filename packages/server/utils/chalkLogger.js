const chalk = require('chalk');

const log = {
	error: message => console.log(chalk.red(message)),
	success: message => console.log(chalk.green(message)),
	log: message => console.log(chalk.yellow(message))
}

module.exports = log