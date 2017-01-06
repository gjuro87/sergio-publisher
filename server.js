/**
 * Module dependencies.
 */
const jsonfile = require('jsonfile')
const express = require('express')
const graph = require('fbgraph')
const app = express()

const conf = require('./config')
const logger = require('./logger')()


// Routes
app.get('/', function (req, res) {
	res.redirect('/auth/facebook')
})

app.get('/auth/facebook', function (req, res) {

	if (!req.query.code) {
		let authUrl = graph.getOauthUrl({
			"client_id": conf.client_id,
			"redirect_uri": conf.redirect_uri,
			"scope": conf.scope
		})

		if (!req.query.error) {
			res.redirect(authUrl)
		} else {  //req.query.error == 'access_denied'
			res.send('Access denied')
		}
		return
	}

	graph.authorize({
		"client_id": conf.client_id,
		"redirect_uri": conf.redirect_uri,
		"client_secret": conf.client_secret,
		"code": req.query.code
	}, function (err, facebookRes) {
		if (err) { logger.logErrorToFile(err) }
		// console.log(facebookRes)
		graph.get(conf.page + "?fields=access_token", function (err, res) {
			if (err) { logger.logErrorToFile(err) }
			// console.log(res)
			let tokens = { user: facebookRes, page: res }
			jsonfile.writeFile(conf.tokenFile, tokens, { spaces: 2 }, function (err, res) {
				if (err) { logger.logErrorToFile(err) }
				res.send('Token retrived OK')
			})
		})
	})

})


let port = process.env.PORT || 3000
app.listen(port, function () {
	console.log("Express server listening on port %d", port)
});