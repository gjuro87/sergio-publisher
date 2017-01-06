"use strict";
const async = require('async')
const _ = require('lodash')

const weather = require('./services/weather')()
const cats = require('./services/cats')()
const fbPublisher = require('./services/fb-publisher')()
const logger = require('./logger')()
const config = require('./config')

module.exports = function () {

	const _randomInt = function (low, high) {
		return Math.floor(Math.random() * (high - low) + low);
	}
	const _calculateTempLevel = function (temp) {
		temp = parseInt(temp)
		if (temp < -6 || temp > 30) { return 5 }
		if (temp < 0 || temp > 25) { return 4 }
		if (temp < 5 || temp > 15) { return 3 }
		if (temp < 9 || temp > 10) { return 2 }
		return 1
	}
	const _calculateWindLevel = function (wind) {
		wind = parseInt(wind)
		if (wind > 70) { return 5 }
		if (wind > 50) { return 4 }
		if (wind > 20) { return 3 }
		if (wind > 5) { return 2 }
		return 1
	}
	const _calculateHumidityLevel = function (humidity) {
		humidity = parseInt(humidity)
		if (humidity > 90) { return 5 }
		if (humidity > 60) { return 4 }
		if (humidity > 40) { return 3 }
		if (humidity > 20) { return 2 }
		return 1
	}
	const _getParameterWithHighestLevel = function (levels) {
		let highestLevelSoFar = 0
		let result
		for (let prop in levels) {
			if (levels[prop] > highestLevelSoFar) {
				result = prop
				highestLevelSoFar = levels[prop]
			}
		}
		return result
	}
	const _getRandomWeather = function (cb) {
		async.waterfall([
			function (next) {
				weather.getTemp(function (err, temp) {
					if (err) { return next(err) }
					return next(null, temp)
				})
			},
			function (temp, next) {
				weather.getWindSpeed(function (err, windSpeed) {
					if (err) { return next(err) }
					return next(null, temp, windSpeed)
				})
			},
			function (temp, windSpeed, next) {
				weather.getHumidity(function (err, humidity) {
					if (err) { return next(err) }
					return next(null, { temp, windSpeed, humidity })
				})
			}
		], function (err, result) {
			if (err) { return cb(err) }
			let levels = {
				temp: _calculateTempLevel(result.temp),
				wind: _calculateWindLevel(result.windSpeed),
				humidity: _calculateHumidityLevel(result.humidity),
			}

			switch (_getParameterWithHighestLevel(levels)) {
				case 'temp':
					return cb(null, config.WEATHER_MESSAGE)
					break
				case 'wind':
					return cb(null, config.WIND_MESSAGE)
					break
				case 'humidity':
					return cb(null, config.HUMIDITY_MESSAGE)
					break
				default:
					return cb(null, config.DEFAULT_MESSAGE)
			}
		})
	}

	const createNewSergioPost = function () {
		async.waterfall([
			function (next) {
				return next(null, cats.getRandomCatImage(), cats.getRandomCatFact())
			},
			function (randomImage, randomCatFact, next) {
				return _getRandomWeather(function (err, weatherRes) {
					if (err) { return next(err) }
					return next(null, randomImage, randomCatFact, weatherRes)
				})
			},
			function (randomImage, randomCatFact, randomWeather, next) {
				let post = ''
				switch (_randomInt(1, 4)) {
					case 1:
						post = randomImage
						break
					case 2:
						post = randomCatFact
						break
					case 3:
						post = randomWeather
						break
				}

				return next(null, post)
			}
		], function (err, post) {
			return fbPublisher.publishPost({ message: post }, function (err, res) {
				if (err) { return logger.logErrorToFile(err) }
				return logger.logInfoToFile(`${Date.now()}: ${res.id}`)
			})
		})
	}
	return { createNewSergioPost }
}