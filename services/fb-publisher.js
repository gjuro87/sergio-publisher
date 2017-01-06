"use strict";

const graph = require('fbgraph')
const jsonfile = require('jsonfile')
const config = require('../config')
let tokens = jsonfile.readFileSync(config.tokenFile)

graph.setAccessToken(tokens.page.access_token)
graph.setVersion("2.8")

module.exports = function () {

	const publishPost = function (content, cb) {
		graph.post(config.page + "/feed", content, cb)
	}

	const getLatestPost = function (cb) {
		graph.get(config.page + "/feed?limit=1", function (err, res) {
			if (err) {
				return cb(err)
			}
			if (res.data) {
				return cb(null, res.data)
			}
			return cb('Error occured!')
		})
	}

	return { publishPost, getLatestPost }
}