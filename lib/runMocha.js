/**
 * module runMocha
 *
 */
var util = require("util"), Mocha = require("mocha");

function runMocha(file, theReporter, saveData) {
	"use strict";
	var mocha = new Mocha();

	if (theReporter && theReporter !== 'null' && theReporter !== 'undefined') {
		var rep = require(theReporter);
		if (typeof rep === 'function') {
			mocha.reporter(rep);
		}
	}
	if (saveData === 'TRUE') mocha.reporter(require(__dirname + "/serialReporter"));

	mocha.addFile(file);
	mocha.run(function(failures){
		process.exit(failures);
	});

}
module.exports = runMocha.apply(null, process.argv.splice(2));