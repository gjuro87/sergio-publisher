const fs = require('fs')
const util = require('util')
const errorLogFile = fs.createWriteStream('error.log', { flags: 'a' })
const infoLogFile = fs.createWriteStream('info.log', { flags: 'a' })


module.exports = function () {
	const logErrorToFile = function (content) {
		errorLogFile.write(util.format.apply(null, arguments) + '\n')
	}
	const logInfoToFile = function (content) {
		infoLogFile.write(util.format.apply(null, arguments) + '\n')
	}
	return { logErrorToFile, logInfoToFile }
}