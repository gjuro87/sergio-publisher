"use strict";

const weather = require('weather-js')
const _ = require('lodash')
const config = require('../config')

module.exports = function () {
	let _forcastCache = {}
	const _getForecast = function (cb) {
		return weather.find({ search: config.location, degreeType: config.degree_type }, function (err, result) {
			if (err) { cb(err) }
			if (_.isArray(result) && !_.isEmpty(result)) { _forcastCache = result[0] }
			return cb(null, _forcastCache)
		});
	}

	const getTemp = function (cb) {
		if (!_.isEmpty(_forcastCache)) { return cb(null, _forcastCache.current.feelslike) }
		return _getForecast(function (err, res) {
			if (err) { return err }
			return cb(null, res.current.feelslike)
		})
	}

	const getWindSpeed = function (cb) {
		if (!_.isEmpty(_forcastCache)) { return cb(null, _forcastCache.current.windspeed) }
		return _getForecast(function (err, res) {
			if (err) { return err }
			return cb(null, res.current.windspeed)
		})
	}

	const getHumidity = function (cb) {
		if (!_.isEmpty(_forcastCache)) { return cb(null, _forcastCache.current.humidity) }
		return _getForecast(function (err, res) {
			if (err) { return err }
			return cb(null, res.current.humidity)
		})
	}

	return { getTemp, getWindSpeed, getHumidity }
}