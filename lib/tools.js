var https = require('https');

module.exports = {

	printName(person) {
		return `${person.last}, ${person.first}`;
	},

	loadWiki(person, callback) {
		var url = `https://en.wikipedia.org/wiki/${person.first}_${person.last}`;
	}

};