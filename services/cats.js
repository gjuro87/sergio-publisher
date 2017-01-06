"use strict";

const randomCat = require('random-cat')
const catFacts = require('cat-facts')

module.exports = function () {

	const getRandomCatImage = function () {
		return randomCat.get()
	}

	const getRandomCatFact = function () {
		return catFacts.random()
	}

	return { getRandomCatImage, getRandomCatFact }
}